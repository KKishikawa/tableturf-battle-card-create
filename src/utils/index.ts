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
