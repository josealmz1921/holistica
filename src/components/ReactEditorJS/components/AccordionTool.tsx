// AccordionTool.ts
export default class AccordionTool {
    static get toolbox() {
        return {
            title: "Acordeón",
            icon: `
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z"/>
        </svg>
      `
        };
    }

    private data: { title: string; content: string };
    private wrapper: HTMLElement;

    constructor({ data }: any) {
        this.data = {
            title: data?.title || "",
            content: data?.content || ""
        };
        this.wrapper = document.createElement("div");
    }

    render() {
        this.wrapper.classList.add("ce-accordion");
        this.wrapper.style.display = 'flex';
        this.wrapper.style.flexDirection = 'column';
        const titleInput = document.createElement("input");
        titleInput.placeholder = "Título del acordeón";
        titleInput.value = this.data.title;
        titleInput.className = "ce-accordion__title";
        titleInput.style.border = '1px solid #ccc'
        titleInput.style.outline = 'none'
        titleInput.style.borderRadius = '5px'
        titleInput.style.padding = '8px'
        titleInput.style.marginBottom = '0.5rem'
        const contentInput = document.createElement("textarea");
        contentInput.placeholder = "Contenido del acordeón";
        contentInput.value = this.data.content;
        contentInput.className = "ce-accordion__content";
        contentInput.style.height = '8rem'
        contentInput.style.border = '1px solid #ccc'
        contentInput.style.outline = 'none'
        contentInput.style.borderRadius = '5px'
        contentInput.style.padding = '8px'
        titleInput.oninput = () => {
            this.data.title = titleInput.value;
        };
        contentInput.oninput = () => {
            this.data.content = contentInput.value;
        };
        this.wrapper.appendChild(titleInput);
        this.wrapper.appendChild(contentInput);
        return this.wrapper;
    }

    save() {
        return this.data;
    }

    validate(savedData: any) {
        return savedData.title.trim() !== "";
    }
}
