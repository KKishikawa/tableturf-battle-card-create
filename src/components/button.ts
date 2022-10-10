import { htmlToElement } from "@/utils";
const buttonBaseHtml = `<button type="button" class="button"></button>`;
export function createButton(label: string, isPrimary?: boolean) {
  const button = htmlToElement(buttonBaseHtml);
  button.classList.add(isPrimary ? "button-primary" : "button-default");
  button.textContent = label;
  return button;
}
