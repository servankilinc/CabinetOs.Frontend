import { isTempId } from '@/models/diagram';

/**
 * Editörün değişiklik günlüğü.
 *
 * **Günlük yalnızca KİMLİK tutar, veri tutmaz.** Grafın güncel hali React Flow
 * state'inde durur (her node kendi DTO'sunu `data` içinde taşır); burada sadece
 * "hangi kayıt oluşturuldu / değişti / silindi" bilgisi var. Gönderi anında istek
 * gövdesi RF state'inden okunarak kurulur.
 *
 * Alternatif — isteği artımlı biriktirmek — aynı node on kez sürüklendiğinde on
 * ayrı taslak üretir ve hangisinin güncel olduğunu takip etmeyi gerektirirdi.
 * Kimlik tutmak bu sorunu tanım gereği ortadan kaldırır.
 */

export type JournalFamily = 'devices' | 'connections' | 'annotations';

export interface FamilyJournal {
  /** Geçici kimlikler (`tmp_*`). */
  created: Set<string>;
  /** Kalıcı sunucu Id'leri. */
  updated: Set<string>;
  /** Kalıcı sunucu Id'leri. */
  deleted: Set<string>;
}

export type DiagramJournal = Record<JournalFamily, FamilyJournal>;

const FAMILIES: JournalFamily[] = ['devices', 'connections', 'annotations'];

export function createJournal(): DiagramJournal {
  return {
    devices: emptyFamily(),
    connections: emptyFamily(),
    annotations: emptyFamily()
  };
}

function emptyFamily(): FamilyJournal {
  return { created: new Set(), updated: new Set(), deleted: new Set() };
}

export function isJournalEmpty(journal: DiagramJournal): boolean {
  return journalSize(journal) === 0;
}

export function journalSize(journal: DiagramJournal): number {
  return FAMILIES.reduce((sum, f) => sum + journal[f].created.size + journal[f].updated.size + journal[f].deleted.size, 0);
}

export function markCreated(journal: DiagramJournal, family: JournalFamily, tempId: string): void {
  journal[family].created.add(tempId);
}

/**
 * Yeni oluşturulmuş bir kaydın güncellenmesi AYRI bir kayıt DEĞİLDİR: o kayıt
 * zaten `created` olarak, güncel haliyle gönderilecek. `updated`'a da eklemek,
 * sunucuya henüz var olmayan bir Id'yi güncellemesini söylemek olurdu.
 */
export function markUpdated(journal: DiagramJournal, family: JournalFamily, id: string): void {
  if (journal[family].created.has(id)) return;
  journal[family].updated.add(id);
}

/**
 * Silme, önceki tüm kayıtları yutar.
 *
 * Sunucuya hiç gitmemiş bir kaydı silmek onu YOK EDER — silme listesine
 * eklenmez, çünkü sunucuda karşılığı yoktur ve `tmp_*` bir Guid'e çevrilemez.
 */
export function markDeleted(journal: DiagramJournal, family: JournalFamily, id: string): void {
  const entry = journal[family];
  if (entry.created.delete(id)) return;
  entry.updated.delete(id);
  entry.deleted.add(id);
}

/**
 * Başarısız bir gönderiyi geri katar.
 *
 * Sunucuda hiçbir şey değişmediği için birleşim kural olarak doğrudur; tek
 * incelik, uçuş sırasında SİLİNEN bir taslağın (ör. `tmp_1` gönderildi, cevap
 * gelmeden kullanıcı onu sildi) her iki listede birden görünmesi. O kayıt
 * sunucuya hiç ulaşmadığı için ikisinden de düşürülür — aksi halde bir sonraki
 * gönderi olmayan bir Id'yi silmeye çalışıp 400 alırdı.
 */
export function mergeJournal(target: DiagramJournal, incoming: DiagramJournal): void {
  for (const family of FAMILIES) {
    const to = target[family];
    const from = incoming[family];

    for (const id of from.created) {
      if (to.deleted.delete(id)) continue;
      to.created.add(id);
    }
    for (const id of from.updated) {
      if (to.created.has(id) || to.deleted.has(id)) continue;
      to.updated.add(id);
    }
    for (const id of from.deleted) {
      to.updated.delete(id);
      to.deleted.add(id);
    }
  }
}

/**
 * Geçici kimlikleri sunucu Id'leriyle değiştirir.
 *
 * Kaydetme uçuştayken yapılan düzenlemeler günlükte hâlâ `tmp_*` ile duruyor
 * olabilir: uçuştaki cihaz bir kez daha sürüklendiyse `updated` içinde, silindiyse
 * `deleted` içinde. Yeniden yazılmazlarsa bir sonraki gönderi sunucuya geçici
 * kimliği Guid diye yollar ve 400 alır.
 *
 * `created` içindeki bir eşleşme artık kalıcıdır: kayıt sunucuda var, sonraki
 * değişikliği bir GÜNCELLEME'dir.
 */
export function applyIdMapToJournal(journal: DiagramJournal, family: JournalFamily, idMap: ReadonlyMap<string, string>): void {
  const entry = journal[family];

  for (const [tempId, serverId] of idMap) {
    if (entry.created.delete(tempId)) entry.updated.add(serverId);
    if (entry.updated.delete(tempId)) entry.updated.add(serverId);
    if (entry.deleted.delete(tempId)) entry.deleted.add(serverId);
  }
}

/**
 * Silme listesinden geçici kimlikleri ayıklar.
 *
 * Savunma amaçlı: normal akışta `markDeleted` onları zaten düşürür, ama tek bir
 * kaçak `tmp_*` tüm gönderiyi 400'e düşürürdü — yani kullanıcının o ana kadarki
 * bütün düzenlemesini.
 */
export function persistedIds(ids: Set<string>): string[] {
  return [...ids].filter(id => !isTempId(id));
}
