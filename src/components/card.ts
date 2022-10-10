import { htmlToElement } from "@/utils";
import { createButton } from "@/components/button";

const cardHtml = `<div class="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"></div>`;
const cardHeadHtml = `<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"></h5>`;
const cardBodyHtml = `<p class="font-normal text-gray-700 dark:text-gray-400"></p>`;
const cardButtonsHtml = `<div class="flex flex-wrap py-2 px-3 -ml-3"></div>`;

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
      button.classList.add("ml-3");
      if (buttonOption.action) {
        button.addEventListener("click", buttonOption.action.bind(buttonOption));
      }
      buttonContainer.append(button);
    }
    cardEl.append(buttonContainer);
  }
  return cardEl;
}
