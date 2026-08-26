import type { DiagramSaveResponse, IdMapEntry } from '@/models/diagram';
import type { DiagramEdge } from './to-rf-edges';
import type { DiagramNode } from './to-rf-nodes';

/**
 * Kaydetme sonrası `tmp_*` kimliklerin sunucu Id'leriyle değiştirilmesi.
 *
 * **Neden şart.** Yeniden yazılmazsa aynı node bir sonraki kaydetmede yine
 * `created` olarak gider ve sunucuda İKİNCİ bir kez oluşturulur. Kullanıcı bunu
 * ancak sayfayı yenilediğinde — çift cihaz olarak — fark eder.
 *
 * Yanıtın tamamını beklemek yerine grafı yeniden çekmek de bir seçenekti; ama
 * refetch, kaydetme uçuştayken yapılan düzenlemeleri ezer.
 */
export function toIdMap(entries: IdMapEntry[]): Map<string, string> {
  return new Map(entries.map(e => [e.tempId, e.id]));
}

export interface GraphIdMaps {
  devices: Map<string, string>;
  connections: Map<string, string>;
  annotations: Map<string, string>;
}

export function toGraphIdMaps(response: DiagramSaveResponse): GraphIdMaps {
  return {
    devices: toIdMap(response.devices),
    connections: toIdMap(response.connections),
    annotations: toIdMap(response.annotations)
  };
}

export function hasAnyMapping(maps: GraphIdMaps): boolean {
  return maps.devices.size > 0 || maps.connections.size > 0 || maps.annotations.size > 0;
}

/**
 * Node kimliklerini yeniden yazar. Cihaz ve not node'ları AYNI id uzayında
 * yaşadığı için iki harita da tek geçişte uygulanır.
 */
export function applyIdMapToNodes(nodes: DiagramNode[], maps: GraphIdMaps): DiagramNode[] {
  return nodes.map(node => {
    const mapped = node.type === 'annotation' ? maps.annotations.get(node.id) : maps.devices.get(node.id);
    if (!mapped) return node;

    // DTO'nun içindeki id de tazelenir: özellikler paneli ve seçim kodu node'un
    // dış kimliğine değil, taşıdığı DTO'ya bakabiliyor.
    if (node.type === 'annotation') {
      return { ...node, id: mapped, data: { annotation: { ...node.data.annotation, id: mapped } } };
    }
    return { ...node, id: mapped, data: { device: { ...node.data.device, id: mapped } } };
  });
}

/**
 * Edge kimliklerini ve UÇLARINI yeniden yazar.
 *
 * `source`/`target` NODE kimliğidir; bir cihaz kalıcı Id'sini aldığında ona bağlı
 * her kablonun ucu da güncellenmek zorunda, yoksa React Flow var olmayan bir
 * node'a bağlı edge görür ve onu çizmez.
 */
export function applyIdMapToEdges(edges: DiagramEdge[], maps: GraphIdMaps): DiagramEdge[] {
  return edges.map(edge => {
    const mappedId = maps.connections.get(edge.id);
    const mappedSource = maps.devices.get(edge.source);
    const mappedTarget = maps.devices.get(edge.target);
    if (!mappedId && !mappedSource && !mappedTarget) return edge;

    const next: DiagramEdge = {
      ...edge,
      id: mappedId ?? edge.id,
      source: mappedSource ?? edge.source,
      target: mappedTarget ?? edge.target
    };

    if (next.data) {
      next.data = {
        connection: {
          ...next.data.connection,
          id: mappedId ?? next.data.connection.id,
          sourceDeviceId: mappedSource ?? next.data.connection.sourceDeviceId,
          targetDeviceId: mappedTarget ?? next.data.connection.targetDeviceId
        }
      };
    }

    return next;
  });
}
