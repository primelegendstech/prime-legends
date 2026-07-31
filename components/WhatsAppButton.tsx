export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5581995716227"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 hover:scale-110 transition"
      aria-label="Falar no WhatsApp"
    >
      <img
        src="/whatsapp-icon.png"
        alt="WhatsApp"
        className="w-24 h-24 object-contain"
      />
    </a>
  );
}