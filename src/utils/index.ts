/**
 * html to dom element
 * @param html representing a single element
 * @returns
 */
export function htmlToElement<T extends HTMLElement>(html: string): T {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstElementChild as T;
}

/** 指定したキーのデータを取得する */
export function getFromStorage<T>(key: string): T | null {
  try {
    const d = localStorage.getItem(key);
    if (d == null) return null;
    return JSON.parse(d);
  } catch (error) {
    console.log(error);
    return null;
  }
}
/** 指定したキーにデータを保存する */
export function setToStrage<T>(key: string, obj: T) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
}

export function saveJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  savefile(blob, filename);
}
/**
 * Blobファイルを保存する
 * @param blob データ
 * @param filename ファイル名
 */
export function savefile(blob: Blob, filename: string) {
  // ie
  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
    // その他ブラウザ
  } else {
    // BlobからオブジェクトURLを作成する
    const url = window.URL.createObjectURL(blob);
    // ダウンロード用にリンクを作成する
    const download = document.createElement("a");
    // リンク先に上記で生成したURLを指定する
    download.href = url;
    // download属性にファイル名を指定する
    download.download = filename;

    document.body.append(download);
    // 作成したリンクをクリックしてダウンロードを実行する
    download.click();

    window.setTimeout(() => {
      download.remove();
      // createObjectURLで作成したオブジェクトURLを開放する
      window.URL.revokeObjectURL(url);
    });
  }
}
