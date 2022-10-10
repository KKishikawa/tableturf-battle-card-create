import { htmlToElement } from "@/utils";
import { createButton } from "@/components/button";

const cardHtml = `<div class="card"></div>`;
const cardHeadHtml = `<h5 class="card__title"></h5>`;
const cardBodyHtml = `<p class="card__body"></p>`;
const cardButtonsHtml = `<div class="card__button-group"></div>`;

export interface ICardOption {
  title?: string;
  body?: string;
  buttons?: IButtonOption[];
}

export function createCard(options: ICardOption) {
  const cardEl = htmlToElement(cardHtml);
  if (options.title) {
    const headEl = htmlToElement(cardHeadHtml);
    headEl.innerHTML = options.title;
    cardEl.append(headEl);
  }
  if (options.body) {
    const bodyEl = htmlToElement(cardBodyHtml);
    bodyEl.innerHTML = options.body;
    cardEl.append(bodyEl);
  }
  if (options.buttons) {
    const buttonContainer = htmlToElement(cardButtonsHtml);
    for (const buttonOption of options.buttons) {
      const button = createButton(buttonOption.label, buttonOption.primary);
      if (buttonOption.action) {
        button.addEventListener("click", buttonOption.action.bind(buttonOption));
      }
      buttonContainer.append(button);
    }
    cardEl.append(buttonContainer);
  }
  return cardEl;
}
