import { z as ensure_array_like, y as attr, F as attr_class, G as stringify } from "../../chunks/index.js";
import { b as base } from "../../chunks/server.js";
import "@sveltejs/kit/internal/server";
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
    let isSaved = false;
    allFieldsFilled = participants.every((p) => p.keywords.trim() !== "");
    selectedParticipant = participants.find((p) => p.id === selectedParticipantId) || participants[0];
    {
      isSaved = false;
    }
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
    $$renderer2.push(`<div class="main svelte-1uha8ag">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="input-section svelte-1uha8ag"><div class="participant-list svelte-1uha8ag"><div class="select-container svelte-1uha8ag"><p class="svelte-1uha8ag">Who are you?</p> `);
      $$renderer2.select(
        { class: "name-input", value: selectedParticipantId },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_6 = ensure_array_like(participants);
          for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
            let p = each_array_6[$$index_6];
            $$renderer3.option({ value: p.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(p.name)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        "svelte-1uha8ag"
      );
      $$renderer2.push(`</div> <div class="rabbit1"><img${attr("src", `${stringify(base)}/rabbit1.png`)} alt="Rabbit illustration" width="120"/></div></div> <div class="keywords-container svelte-1uha8ag"><p class="svelte-1uha8ag">What are you up to?</p> <textarea class="keywords-input svelte-1uha8ag" placeholder="Keywords (comma separated)" rows="6">`);
      const $$body = escape_html(selectedParticipant.keywords);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div></div> <div class="action-section"><button class="save-button svelte-1uha8ag">`);
      if (isSaved) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Saved`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`Save`);
      }
      $$renderer2.push(`<!--]--></button> <button${attr_class("generate-button svelte-1uha8ag", void 0, { "disabled": !allFieldsFilled || isGenerating })}${attr("disabled", !allFieldsFilled || isGenerating, true)}>`);
      {
        $$renderer2.push("<!--[!-->");
        if (!allFieldsFilled) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Waiting for everyone (${escape_html(participants.filter((p) => p.name.trim() && p.keywords.trim()).length)}/15)`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`Generate Order`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></button></div> <div class="clear-section svelte-1uha8ag"><p class="clear-sign svelte-1uha8ag">don't press it unless the term is over</p> <button class="clear-button svelte-1uha8ag"><span>DANGER!! <br/> Clear all data</span></button></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
