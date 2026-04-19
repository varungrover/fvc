"use client";

import { useState } from "react";
import Link from "next/link";

type Card = {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
};

const INITIAL_CARDS: Card[] = [
  {
    id: "card_1",
    brand: "Visa",
    last4: "4242",
    expMonth: "12",
    expYear: "28",
    isDefault: true,
  },
  {
    id: "card_2",
    brand: "Mastercard",
    last4: "8210",
    expMonth: "06",
    expYear: "27",
    isDefault: false,
  },
];

const BRAND_STYLES: Record<string, { bg: string; text: string }> = {
  Visa: { bg: "from-purple-600 to-purple-800", text: "VISA" },
  Mastercard: { bg: "from-orange-500 to-red-600", text: "MC" },
  Amex: { bg: "from-slate-500 to-slate-700", text: "AMEX" },
};

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function handleSetDefault(cardId: string) {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === cardId }))
    );
  }

  function handleDelete(cardId: string) {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setDeleteConfirm(null);
  }

  function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    const rawNum = newCard.number.replace(/\s/g, "");
    const last4 = rawNum.slice(-4);

    // Detect brand from first digit
    const firstDigit = rawNum[0];
    let brand = "Visa";
    if (firstDigit === "5") brand = "Mastercard";
    else if (firstDigit === "3") brand = "Amex";

    const [expMonth, expYear] = newCard.expiry.split("/");

    const card: Card = {
      id: `card_${Date.now()}`,
      brand,
      last4,
      expMonth: expMonth || "01",
      expYear: expYear || "30",
      isDefault: cards.length === 0,
    };

    setCards((prev) => [...prev, card]);
    setNewCard({ number: "", expiry: "", cvc: "", name: "" });
    setShowAddForm(false);
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/parent/payments" className="text-slate-500 hover:text-white transition-colors">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your saved cards for payments.
          </p>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-4 mb-6">
        {cards.map((card) => {
          const brandStyle = BRAND_STYLES[card.brand] ?? BRAND_STYLES.Visa;
          const isDeleting = deleteConfirm === card.id;

          return (
            <div
              key={card.id}
              className={`bg-card-dark border rounded-xl p-5 transition-all duration-200 ${
                card.isDefault
                  ? "border-primary/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                  : "border-border-dark"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Card brand icon */}
                <div
                  className={`w-14 h-9 rounded-lg bg-gradient-to-br ${brandStyle.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-bold tracking-wider">
                    {brandStyle.text}
                  </span>
                </div>

                {/* Card details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">
                      {card.brand} •••• {card.last4}
                    </p>
                    {card.isDefault && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Expires {card.expMonth}/{card.expYear}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="text-xs text-slate-500 hover:text-primary font-medium transition-colors px-2 py-1"
                    >
                      Set default
                    </button>
                  )}
                  {isDeleting ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-xs text-error hover:text-red-400 font-semibold transition-colors px-2 py-1"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(card.id)}
                      className="text-slate-500 hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
                      title="Remove card"
                    >
                      <span className="material-icons-round text-[18px]">delete_outline</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {cards.length === 0 && !showAddForm && (
          <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-10 text-center">
            <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
              credit_card_off
            </span>
            <p className="text-slate-500 font-medium">No payment methods saved</p>
            <p className="text-slate-500 text-sm mt-1">Add a card to get started.</p>
          </div>
        )}
      </div>

      {/* Add card form */}
      {showAddForm ? (
        <form
          onSubmit={handleAddCard}
          className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">Add new card</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            This is a demo — no real card will be stored.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cardholder name
            </label>
            <input
              type="text"
              required
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              placeholder="Full name on card"
              className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Card number
            </label>
            <input
              type="text"
              required
              value={newCard.number}
              onChange={(e) =>
                setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })
              }
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expiry date
              </label>
              <input
                type="text"
                required
                value={newCard.expiry}
                onChange={(e) =>
                  setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })
                }
                placeholder="MM/YY"
                maxLength={5}
                className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CVC</label>
              <input
                type="text"
                required
                value={newCard.cvc}
                onChange={(e) =>
                  setNewCard({
                    ...newCard,
                    cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="123"
                maxLength={4}
                className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-200"
            >
              Save card
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-3 border border-border-dark rounded-lg text-slate-700 hover:text-white hover:bg-surface-hover font-medium text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-border-dark text-slate-500 text-sm font-medium hover:border-primary/50 hover:text-primary transition-all duration-200"
        >
          <span className="material-icons-round text-base">add_circle_outline</span>
          Add a new card
        </button>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 px-1 mt-6">
        <span className="material-icons-round text-slate-500 text-base">verified_user</span>
        <p className="text-xs text-slate-500">
          Card information is encrypted and securely stored via Stripe. We never have access to your
          full card details.
        </p>
      </div>
    </div>
  );
}
