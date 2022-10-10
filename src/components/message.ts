import { htmlToElement } from "@/utils";
const messageBaseHtml = `<div class="pointer-events-auto flex p-3 text-sm rounded-lg mx-auto w-5/6 max-w-lg break-all" role="alert">
<div class="flex-shrink-0 w-5 h-5 mr-3 text-base flex items-center"><i aria-hidden="true"></i></div><span class="sr-only">Info</span><div class="message-text"></div>
<button type="button" class="ml-auto -mx-1.5 -my-1.5 text-base flex-shrink-0 justify-center items-center rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8" aria-label="Close">
<span class="sr-only">Close</span><i class="fa fa-xmark"></i></button></div>`;
interface IMessageCss {
  outer: string;
  icon: string;
  dismiss: string;
}
const infoStyle: IMessageCss = {
  outer: " text-blue-700 bg-blue-100 dark:bg-blue-200 dark:text-blue-800",
  icon: " fa-solid fa-circle-info",
  dismiss:
    " bg-blue-100 text-blue-500 focus:ring-blue-400 hover:bg-blue-200 dark:bg-blue-200 dark:text-blue-600 dark:hover:bg-blue-300",
};
const errorStyle: IMessageCss = {
  outer: " text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800",
  icon: " fa-solid fa-circle-xmark",
  dismiss:
    " bg-red-100 text-red-500 focus:ring-red-400 hover:bg-red-200 dark:bg-red-200 dark:text-red-600 dark:hover:bg-red-300",
};
const successStyle: IMessageCss = {
  outer: " text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800",
  icon: " fa-solid fa-circle-check",
  dismiss:
    " bg-green-100 text-green-500 focus:ring-green-400 hover:bg-green-200 dark:bg-green-200 dark:text-green-600 dark:hover:bg-green-300",
};
const warnStyle: IMessageCss = {
  outer:
    " text-yellow-700 bg-yellow-100 dark:bg-yellow-200 dark:text-yellow-800",
  icon: " fa-solid fa-circle-exclamation",
  dismiss:
    " bg-yellow-100 text-yellow-500 focus:ring-yellow-400 hover:bg-yellow-200 dark:bg-yellow-200 dark:text-yellow-600 dark:hover:bg-yellow-300",
};
const closeMessageStyle = ["-translate-y-full", "opacity-0", "max-h-0"];
class Message {
  private readonly element: HTMLElement;
  private closeProcId = -1;
  constructor(message: string, styleInfo: IMessageCss) {
    // create message element
    const messageBaseEl = htmlToElement(messageBaseHtml);
    (messageBaseEl.querySelector(".message-text") as HTMLElement).innerText =
      message;
    messageBaseEl.className += styleInfo.outer;
    messageBaseEl.querySelector("i")!.className += styleInfo.icon;
    messageBaseEl.querySelector("button")!.className += styleInfo.dismiss;
    const msgWrapper = document.createElement("div");
    msgWrapper.className =
      "relative z-40 w-full max-h-full mt-4 transition-all duration-300 ease-out";
    msgWrapper.append(messageBaseEl);
    this.element = msgWrapper;

    // button event
    messageBaseEl.querySelector("button")?.addEventListener("click", () => {
      this.close();
    });

    msgWrapper.classList.add(...closeMessageStyle);
    document.getElementById("app-modal_container")!.append(msgWrapper);
    // open animate
    window.setTimeout(() => {
      msgWrapper.classList.remove(...closeMessageStyle);
    });

    // message show duration
    this.closeProcId = window.setTimeout(() => {
      this.close();
    }, 3000)
  }
  close() {
    window.clearTimeout(this.closeProcId);
    this.element.classList.add(...closeMessageStyle);
    window.setTimeout(() => {
      this.element.remove();
    }, 300);
  }
}
export function show(
  message: string,
  style: "info" | "warn" | "success" | "error"
) {
  let styleInfo: IMessageCss;
  switch (style) {
    case "success":
      styleInfo = successStyle;
      break;
    case "error":
      styleInfo = errorStyle;
      break;
    case "warn":
      styleInfo = warnStyle;
      break;
    default:
      styleInfo = infoStyle;
      break;
  }
  return new Message(message, styleInfo);
}

export function info(message: string) {
  return new Message(message, infoStyle);
}
export function success(message: string) {
  return new Message(message, successStyle);
}

export function error(message: string) {
  return new Message(message, errorStyle);
}

export function warn(message: string) {
  return new Message(message, warnStyle);
}
