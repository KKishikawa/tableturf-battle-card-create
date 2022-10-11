import * as RecordUtil from "@/utils/variableRecord";
export interface ICardRaw {
  no: number;
  /** sp必要数 */
  sp: number;
  name: string;
  /** spマス */
  spx: string;
  /** sp以外マス */
  px: string;
  rarity: number;
}
export interface ICard {
  no: number;
  /** sp必要数 */
  sp: number;
  name: string;
  /** spマス */
  spx: number[];
  /** sp以外マス */
  px: number[];
  rarity: number;
}

export const RARITY = ["コモン", "レア", "フレッシュ"];
/** 塗り情報文字列を座標配列に復元します */
export function encodeInkInfo(val: number[] | null | undefined) {
  return RecordUtil.writeFixRecord(val);
}
/** 塗り座標数列を情報文字列に変換します */
export function decodeInkInfo(val: string | null | undefined) {
  return RecordUtil.readeFixRecord(val);
}
