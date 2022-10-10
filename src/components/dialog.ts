import { htmlToElement } from "@/utils";
import { createButton } from "@/components/button";

const closeModalWrapperStyle = ["opacity-0"];
const closeModalStyle = ["scale-0"];
export interface IModalOption {
  title?: string;
  body?: string;
  buttons?: IModalButtonOption[];
  onClose?: () => void;
}
export interface IModalButtonOption {
  primary?: boolean;
  label: string;
  icon?: string;
  action?: ((closeFunc: (preventHandler?: boolean) => void) => void) | "close";
}
export class ModalDialog {
  element: HTMLElement;
  onCloseHandler?: () => void;
  constructor(options: IModalOption) {
    this.onCloseHandler = options.onClose;
    const container = document.getElementById("app-modal_container")!;
    this.element = htmlToElement(
      `<div tabindex="-1" aria-hidden="true" class="transition-opacity pointer-events-auto bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40">
<div tabindex="-1" aria-hidden="true" class="modal flex justify-center items-center overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 md:h-full">
    <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
        <div class="modal-content relative transition-transform duration-200 bg-white rounded-lg shadow dark:bg-gray-700"></div>
    </div>
</div>
</div>`
    );
    const modal_content = this.element.querySelector(".modal-content")!;
    const modal_header = document.createElement("div");
    modal_header.className =
      "flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600";
    modal_header.innerHTML = `<h3 class="modal-title text-xl font-semibold text-gray-900 dark:text-white"></h3>
    <button type="button" class="modal-close text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-base text-center w-8 h-8 p-1.5 ml-auto inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
    <i aria-hidden="true" class="fa fa-xmark"></i>
    <span class="sr-only">Close modal</span>
    </button>`;
    if (options.title != null) {
      modal_header.querySelector(".modal-title")!.textContent = options.title;
    }
    modal_content.append(modal_header);

    if (options.body != null) {
      const modal_body = document.createElement("div");
      modal_body.className =
        "p-6 space-y-6 text-base leading-relaxed text-gray-500 dark:text-gray-400";
      modal_body.innerText = options.body;
      modal_content.append(modal_body);
    }
    if (options.buttons) {
      const modal_footer = document.createElement("div");
      modal_footer.className =
        "flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600";
      for (const buttonOption of options.buttons) {
        const button = createButton(buttonOption.label, buttonOption.primary);
        if (buttonOption.action) {
          if (buttonOption.action === "close") {
            // 閉じるクラスを追加
            button.classList.add("modal-close");
          } else {
            const action = buttonOption.action.bind(buttonOption);
            button.addEventListener("click", () => {
              action(this.closeModal.bind(this));
            });
          }
        }
        if (buttonOption.icon) {
          const icon = document.createElement("i");
          icon.className = buttonOption.icon;
          button.prepend(icon);
        }
        modal_footer.append(button);
      }
      modal_content.append(modal_footer);
    }
    this.element.addEventListener("click", (e) => {
      if (!e.target || !(e.target instanceof HTMLElement)) return;
      if (
        e.target.closest(".modal-close") ||
        !e.target.closest(".modal-content")
      ) {
        this.closeModal();
        return;
      }
    });
    modal_content.classList.add(...closeModalStyle);
    this.element.classList.add(...closeModalWrapperStyle);
    container.append(this.element);
    // open animate
    window.setTimeout(() => {
      modal_content.classList.remove(...closeModalStyle);
      this.element.classList.remove(...closeModalWrapperStyle);
    });
  }
  closeModal(preventHandler?: boolean) {
    this.element.querySelector(".modal-content")!.classList.add(...closeModalStyle);
    this.element.classList.add(...closeModalWrapperStyle);
    window.setTimeout(() => {
      this.element.remove();
    }, 300);
    if (!preventHandler && this.onCloseHandler) {
      this.onCloseHandler();
    }
  }
}

export interface IPromptOption {
  title?: string;
  message?: string;
}
export interface IComfirmOption extends IPromptOption {
  okLabel?: string;
  cancelLabel?: string;
}
export interface IAlertOption extends IPromptOption {
  closeLabel?: string;
}

export function confirm(option: IComfirmOption) {
  return new Promise<void>(function (resolve, reject) {
    new ModalDialog({
      title: option.title,
      body: option.message,
      buttons: [
        {
          label: "OK",
          primary: true,
          action(closeFunc) {
            resolve();
            closeFunc(true);
          },
        },
        {
          label: "キャンセル",
          action: "close",
        },
      ],
      onClose() {
        reject();
      },
    });
  });
}

export function alert(options: IAlertOption) {
  return new Promise<void>(function (resolve) {
    new ModalDialog({
      title: options.title,
      body: options.message,
      buttons: [
        {
          primary: true,
          label: "OK",
          action: "close",
        },
      ],
      onClose() {
        resolve();
      },
    });
  });
}
