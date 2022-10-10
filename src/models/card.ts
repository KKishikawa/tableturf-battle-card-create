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
