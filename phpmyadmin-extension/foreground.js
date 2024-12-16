const typeMap = [
    ["varchar", "text", "string"],
    ["timestamp", "date", "time", "DateTime"],
    ["currency", "decimal"],
    ["tinyint", "byte"],
    ["enum", "int"]
];

function InjectButton() {
    const printBtn = document.querySelector('img[title="Print"]')?.parentElement?.parentElement;
    if(!printBtn) {
        console.log('printBtn not found');
        return;
    }

    const codeButtonHtml = `<button id="copy-as-code" type="button" style="border: none;outline: none;background-color: #ccc;border-radius: 0.5rem;font-weight: 600;">
        Copy
		<svg id="copy-check-icon" style="display:none;" fill="#32a852" width="25" height="25" viewBox="-5 -7 24 24"><path d="M5.486 9.73a1 1 0 0 1-.707-.292L.537 5.195A1 1 0 1 1 1.95 3.78l3.535 3.535L11.85.952a1 1 0 0 1 1.415 1.414L6.193 9.438a1 1 0 0 1-.707.292"/></svg>
        <svg id="copy-code-icon" fill="#000" width="25" height="25" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m48 256 144-144 32 32-112 112 112 112-32 32zm240 112 112-112-112-112 32-32 144 144-144 144z"/></svg>
        </button>`;

    printBtn.insertAdjacentHTML('beforebegin', codeButtonHtml)

    const codeBtn = document.getElementById('copy-as-code');
    if(!codeBtn) {
        console.log('codeBtn not found');
        return;
    }

    codeBtn.addEventListener('click', () => {
        const tableElem = document.querySelector('.breadcrumb-item a[href*="table="]');
        if(!tableElem || !tableElem.hasAttribute('data-raw-text')) {
            console.log('tableElem not found');
            return;
        }

        const tableName = tableElem.getAttribute('data-raw-text');

        const tableRows = document.getElementById('tablestructure').querySelectorAll('tr');
        let outputText = `public class ${tableName}\n{\n`;

        tableRows.forEach(row => {
            const columnLabel = row.querySelector('[name="selected_fld[]"]');
            if(!columnLabel) {
                console.log('columnLabel not found');
                return;
            }

            const fieldName = columnLabel.value;
            let fieldType = row.querySelector('bdo').innerText;
            if(fieldType.includes('(')) {
                fieldType = fieldType.split('(')[0];
            }

            outputText += `\tpublic ${typeMap.find(x => x.some(y => y.includes(fieldType)))?.at(-1) || 'object'} ${fieldName} { get; set; }\n`;
        });

        outputText += '}';

        navigator.clipboard.writeText(outputText).then(() => {
            document.getElementById('copy-code-icon').style.display = 'none';
			document.getElementById('copy-check-icon').style.display = '';

			setTimeout(() => {
				document.getElementById('copy-code-icon').style.display = '';
				document.getElementById('copy-check-icon').style.display = 'none';
			}, 2000);
			
        }).catch(err => {
            alert('Error copying to clipboard.');
        });
    });
}

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if(document.getElementById('structure_content') && !document.getElementById('copy-as-code')) {
				InjectButton();
			}
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
	const config = { childList: true, subtree: true };
	observer.observe(document.body, config);
});