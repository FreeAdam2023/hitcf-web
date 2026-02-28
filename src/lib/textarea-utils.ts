/**
 * Insert text at the current cursor position in a textarea,
 * triggering React's onChange via the native input setter.
 */
export function insertTextAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  const newValue = value.slice(0, start) + text + value.slice(end);

  // Use native setter so React detects the change
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  nativeInputValueSetter?.call(textarea, newValue);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Restore cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.selectionStart = start + text.length;
    textarea.selectionEnd = start + text.length;
    textarea.focus();
  });
}
