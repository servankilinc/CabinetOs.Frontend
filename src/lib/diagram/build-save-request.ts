import {
  emptyDelta,
  type AnnotationCreateDraft,
  type AnnotationUpdateDraft,
  type ConnectionCreateDraft,
  type ConnectionUpdateDraft,
  type DeviceCreateDraft,
  type DeviceUpdateDraft,
  type DiagramSaveRequest
} from '@/models/diagram';
import { persistedIds, type DiagramJournal } from './journal';
import type { AnnotationNode, DeviceNode, DiagramNode } from './to-rf-nodes';
import type { DiagramEdge } from './to-rf-edges';

/**
 * Koordinat React Flow'dan, geri kalan DTO'dan okunur.** Sürükleme sırasında konumu RF kendi tutar (`node.position`); 
 */
export function buildSaveRequest(nodes: DiagramNode[], edges: DiagramEdge[], journal: DiagramJournal): DiagramSaveRequest {
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  const edgeById = new Map(edges.map(e => [e.id, e]));

  const devices = emptyDelta<DeviceCreateDraft, DeviceUpdateDraft>();
  const connections = emptyDelta<ConnectionCreateDraft, ConnectionUpdateDraft>();
  const annotations = emptyDelta<AnnotationCreateDraft, AnnotationUpdateDraft>();

  for (const tempId of journal.devices.created) {
    const node = deviceNode(nodeById.get(tempId));
    if (node) devices.created.push(toDeviceCreateDraft(node));
  }
  for (const id of journal.devices.updated) {
    const node = deviceNode(nodeById.get(id));
    if (node) devices.updated.push(toDeviceUpdateDraft(node));
  }
  devices.deleted = persistedIds(journal.devices.deleted);

  for (const tempId of journal.connections.created) {
    const edge = edgeById.get(tempId);
    if (edge?.data) connections.created.push(toConnectionCreateDraft(edge));
  }
  for (const id of journal.connections.updated) {
    const edge = edgeById.get(id);
    if (edge?.data) connections.updated.push(toConnectionUpdateDraft(edge));
  }
  connections.deleted = persistedIds(journal.connections.deleted);

  for (const tempId of journal.annotations.created) {
    const node = annotationNode(nodeById.get(tempId));
    if (node) annotations.created.push(toAnnotationCreateDraft(node));
  }
  for (const id of journal.annotations.updated) {
    const node = annotationNode(nodeById.get(id));
    if (node) annotations.updated.push(toAnnotationUpdateDraft(node));
  }
  annotations.deleted = persistedIds(journal.annotations.deleted);

  return { devices, connections, annotations };
}

function deviceNode(node: DiagramNode | undefined): DeviceNode | null {
  return node?.type === 'template' ? node : null;
}

function annotationNode(node: DiagramNode | undefined): AnnotationNode | null {
  return node?.type === 'annotation' ? node : null;
}

function toDeviceCreateDraft(node: DeviceNode): DeviceCreateDraft {
  const { device } = node.data;
  return {
    tempId: node.id,
    componentTemplateId: device.componentTemplateId,
    name: device.name,
    coordinateX: node.position.x,
    coordinateY: node.position.y,
    rotation: device.rotation,
    zIndex: device.zIndex,
    isLocked: device.isLocked,
    isVisible: device.isVisible,
    externalCode: device.externalCode
  };
}

function toDeviceUpdateDraft(node: DeviceNode): DeviceUpdateDraft {
  const { device } = node.data;
  return {
    id: node.id,
    name: device.name,
    coordinateX: node.position.x,
    coordinateY: node.position.y,
    rotation: device.rotation,
    zIndex: device.zIndex,
    isLocked: device.isLocked,
    isVisible: device.isVisible,
    externalCode: device.externalCode
  };
}

function toConnectionCreateDraft(edge: DiagramEdge): ConnectionCreateDraft {
  const { connection } = edge.data!;
  return {
    tempId: edge.id,
    // Uçlar KALICI pin kimliğidir: pinleri sunucu, cihazla birlikte şablondan
    // üretir — aynı gönderide doğan bir pine kablo çizmek mümkün değil.
    sourcePinId: connection.sourcePinId,
    targetPinId: connection.targetPinId,
    label: connection.label,
    wireType: connection.wireType,
    color: connection.color,
    lineStyle: connection.lineStyle,
    strokeWidth: connection.strokeWidth,
    routing: connection.routing,
    waypoints: connection.waypoints,
    zIndex: connection.zIndex
  };
}

function toConnectionUpdateDraft(edge: DiagramEdge): ConnectionUpdateDraft {
  const { connection } = edge.data!;
  return {
    id: edge.id,
    label: connection.label,
    wireType: connection.wireType,
    color: connection.color,
    lineStyle: connection.lineStyle,
    strokeWidth: connection.strokeWidth,
    routing: connection.routing,
    waypoints: connection.waypoints,
    zIndex: connection.zIndex
  };
}

function toAnnotationCreateDraft(node: AnnotationNode): AnnotationCreateDraft {
  const { annotation } = node.data;
  return {
    tempId: node.id,
    name: annotation.name,
    coordinateX: node.position.x,
    coordinateY: node.position.y,
    width: annotation.width,
    height: annotation.height,
    rotation: annotation.rotation,
    zIndex: annotation.zIndex,
    isLocked: annotation.isLocked,
    isVisible: annotation.isVisible,
    text: annotation.text,
    shape: annotation.shape,
    backgroundColor: annotation.backgroundColor,
    fontColor: annotation.fontColor,
    fontSize: annotation.fontSize,
    isBold: annotation.isBold,
    borderColor: annotation.borderColor
  };
}

function toAnnotationUpdateDraft(node: AnnotationNode): AnnotationUpdateDraft {
  const { annotation } = node.data;
  return {
    id: node.id,
    name: annotation.name,
    coordinateX: node.position.x,
    coordinateY: node.position.y,
    width: annotation.width,
    height: annotation.height,
    rotation: annotation.rotation,
    zIndex: annotation.zIndex,
    isLocked: annotation.isLocked,
    isVisible: annotation.isVisible,
    text: annotation.text,
    shape: annotation.shape,
    backgroundColor: annotation.backgroundColor,
    fontColor: annotation.fontColor,
    fontSize: annotation.fontSize,
    isBold: annotation.isBold,
    borderColor: annotation.borderColor
  };
}
