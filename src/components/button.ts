import { htmlToElement } from "@/utils";
const buttonBaseHtml = `<button type="button" class="focus:ring-4 focus:outline-none rounded-lg text-sm font-medium px-5 py-2.5 focus:z-10"></button>`;
const buttonStyle = " text-gray-500 bg-white hover:bg-gray-100 focus:ring-blue-300 border border-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600";
const buttonPrimaryStyle = " text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
export function createButton(label: string, isPrimary?: boolean) {
  const button = htmlToElement(buttonBaseHtml);
  button.className += isPrimary ? buttonPrimaryStyle : buttonStyle;
  button.textContent = label;
  return button;
}
