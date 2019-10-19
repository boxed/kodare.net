// Fix some common incorrect URLs
const incorrect_strings = [
    '.html)',
    '.html%',
];

for (const incorrect in incorrect_strings) {
    const i = document.location.href.indexOf(incorrect);
    if (i !== -1) {
        document.location.href = document.location.href.slice(0, i + incorrect.length - 1);
    }
}
