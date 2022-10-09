/** 数列を読み込む */
export function readVariableRecord(
  rawstr: string | null | undefined
): number[] {
  if (!rawstr) return [];
  const ret = [];
  let continuous = false;
  for (const char of rawstr) {
    // one char is a 5bit
    const cur_input_raw = parseInt(char, 32);
    // return empty array if invalid value
    if (!isFinite(cur_input_raw)) return [];
    const cur_input = cur_input_raw & 0b1111;
    if (continuous) {
      ret[ret.length - 1] += cur_input << 4;
    } else {
      ret.push(cur_input);
    }
    continuous = (cur_input_raw & 0b10000) > 0;
  }
  return ret;
}
/** 数列を短縮文字列に変換する */
export function writeVariableRecord(
  record: number[] | null | undefined
): string {
  if (!record || record.length < 1) return "";
  const writer = new VariableRecordWriter();
  for (const num of record) {
    writer.write(num);
  }
  return writer.data.join("");
}

class VariableRecordWriter {
  data: string[] = [];
  public write(val: number) {
    const nextVal = val >> 4;
    const tetra = val & 0b1111;
    if (nextVal > 0) {
      this.innerWriteSeq(tetra | 0b10000);
      this.write(nextVal);
    } else {
      this.innerWriteSeq(tetra);
    }
  }
  private innerWriteSeq(val: number) {
    this.data.push(val.toString(32));
  }
}
