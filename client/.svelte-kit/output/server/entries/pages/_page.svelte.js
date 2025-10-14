import { z as ensure_array_like, F as attr_class, y as attr } from "../../chunks/index.js";
import { e as escape_html } from "../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedParticipant;
    let participants = [
      { name: "Arnar", id: 0, keywords: "" },
      { name: "Cassandra", id: 1, keywords: "" },
      { name: "Costanza", id: 2, keywords: "" },
      { name: "Diana", id: 3, keywords: "" },
      { name: "Haotong", id: 4, keywords: "" },
      { name: "Kosara", id: 5, keywords: "" },
      { name: "Li", id: 6, keywords: "" },
      { name: "Luca M", id: 7, keywords: "" },
      { name: "Luca W", id: 8, keywords: "" },
      { name: "Lucas G", id: 9, keywords: "" },
      { name: "Martina", id: 10, keywords: "" },
      { name: "Matteo", id: 11, keywords: "" },
      { name: "Samuel", id: 12, keywords: "" },
      { name: "Sergio", id: 13, keywords: "" },
      { name: "Zhiyi", id: 14, keywords: "" }
    ];
    let isGenerating = false;
    let allFieldsFilled = false;
    let presentationOrder = [];
    let selectedParticipantId = 0;
    allFieldsFilled = participants.every((p) => p.keywords.trim() !== "");
    selectedParticipant = participants.find((p) => p.id === selectedParticipantId) || participants[0];
    participants.filter((p) => p.keywords.trim() !== "").length;
    presentationOrder.reduce(
      (acc, participant, index) => {
        const theme = participant.theme;
        if (!acc[theme]) {
          acc[theme] = [];
        }
        acc[theme].push({ ...participant, position: index + 1 });
        return acc;
      },
      {}
    );
    $$renderer2.push(`<div class="container"></div> <h1>Presentation randomizer</h1> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="input-section"><h2>Enter information</h2> <p>All 15 participants must fill out their information before generating the order</p> <div class="participant-list"><div class="select-container">`);
      $$renderer2.select({ class: "name-input", value: selectedParticipantId }, ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(participants);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let p = each_array_2[$$index_2];
          $$renderer3.option({ value: p.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(p.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div class="keywords-container"><textarea class="keywords-input" placeholder="Keywords (comma separated)" rows="6">`);
      const $$body = escape_html(selectedParticipant.keywords);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div></div> <button>Save</button> <div class="action-section"><button${attr_class("generate-button", void 0, { "disabled": !allFieldsFilled || isGenerating })}${attr("disabled", !allFieldsFilled || isGenerating, true)}>`);
      {
        $$renderer2.push("<!--[!-->");
        if (!allFieldsFilled) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Waiting for all participants (${escape_html(participants.filter((p) => p.name.trim() && p.keywords.trim()).length)}/15)`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`Generate Presentation Order`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></button></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
