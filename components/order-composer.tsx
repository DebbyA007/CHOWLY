"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { animate, createScope, createSpring, createTimeline, svg } from "animejs";
import { MAX_PER_ITEM, cartCount, cartLines, cartTotalKobo, type Cart } from "@/lib/cart";
import type { MenuItemView, MenuView } from "@/lib/menu";
import { CartTray, type PlacedTicket } from "./cart-tray";
import { MenuBoard } from "./menu-board";

type Scope = ReturnType<typeof createScope>;

// Owns the cart and the two motions that answer an action on this page: an added item
// arcs to the tray along an SVG motion path and the badge lands on a spring, and on
// submit the tray folds into a printed ticket that slides away before the order page
// opens. Both collapse to nothing more than an opacity change under reduced motion.
export function OrderComposer({ menu }: { menu: MenuView }) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({});
  const [tableNo, setTableNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedTicket | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scope.current = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion)" },
    }).add((self) => {
      if (!self) return;
      const reduce = self.matches.reduceMotion === true;

      self.add("fly", (from: DOMRect, to: DOMRect) => {
        const badge = root.current?.querySelector<HTMLElement>(".cart-badge");
        if (reduce) {
          if (badge) animate(badge, { opacity: [0.3, 1], duration: 200 });
          return;
        }
        const path = pathRef.current;
        const layer = layerRef.current;
        if (!path || !layer) return;
        const x1 = from.left + from.width / 2;
        const y1 = from.top + from.height / 2;
        const x2 = to.left + to.width / 2;
        const y2 = to.top + to.height / 2;
        path.setAttribute("d", `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 140} ${x2} ${y2}`);

        const flyer = document.createElement("span");
        flyer.setAttribute("aria-hidden", "true");
        flyer.className = "flyer";
        Object.assign(flyer.style, {
          position: "fixed",
          left: "-11px",
          top: "-11px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "var(--chalk)",
          border: "1.5px solid var(--rim)",
          pointerEvents: "none",
          zIndex: "50",
        });
        layer.appendChild(flyer);
        const { translateX, translateY } = svg.createMotionPath(path);
        animate(flyer, {
          translateX,
          translateY,
          scale: [1, 0.55],
          duration: 650,
          ease: "inOutQuad",
          onComplete: () => {
            flyer.remove();
            if (badge) animate(badge, { scale: [1.5, 1], ease: createSpring({ stiffness: 320, damping: 13 }) });
          },
        });
      });

      self.add("fold", (onDone: () => void) => {
        if (reduce) {
          onDone();
          return;
        }
        createTimeline({ onComplete: onDone })
          .add(".tray-body", { scaleY: [1, 0.04], opacity: [1, 0], duration: 320, ease: "inQuad" })
          .add(".ticket-flight", { scaleY: [0.04, 1], opacity: [0, 1], duration: 420, ease: "outBack" })
          .add(".ticket-flight", { y: -140, x: 80, opacity: 0, duration: 520, ease: "inQuad" }, "+=700");
      });
    });

    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    if (!placed) return;
    scope.current?.methods.fold?.(() => router.push(`/order/${placed.id}`));
  }, [placed, router]);

  function add(item: MenuItemView, button: HTMLElement) {
    setError(null);
    setCart((current) => ({ ...current, [item.id]: Math.min(MAX_PER_ITEM, (current[item.id] ?? 0) + 1) }));
    const badge = root.current?.querySelector<HTMLElement>(".cart-badge");
    if (badge) scope.current?.methods.fly?.(button.getBoundingClientRect(), badge.getBoundingClientRect());
  }

  function remove(item: MenuItemView) {
    setError(null);
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[item.id] ?? 0) - 1;
      if (quantity > 0) next[item.id] = quantity;
      else delete next[item.id];
      return next;
    });
  }

  const lines = cartLines(cart, menu);
  const count = cartCount(cart);
  const totalKobo = cartTotalKobo(lines);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError("Add a dish before placing the order.");
      return;
    }
    if (!tableNo.trim()) {
      setError("Enter the number printed on your table.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tableNo: tableNo.trim(),
          items: lines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
        }),
      });
      const json = (await response.json().catch(() => null)) as
        | { id: string; reference: string; waitMinutes: number; total: string; error?: string }
        | null;
      if (!response.ok || !json) {
        setError(json?.error ?? "The order could not be placed. Check the connection and try again.");
        return;
      }
      setPlaced({ id: json.id, reference: json.reference, waitMinutes: json.waitMinutes, total: json.total });
    } catch {
      setError("The order could not be placed. Check the connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={root}>
      <MenuBoard menu={menu} cart={cart} onAdd={add} onRemove={remove} />
      <div ref={layerRef} aria-hidden="true" />
      <svg className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true">
        <path ref={pathRef} fill="none" stroke="none" />
      </svg>
      <CartTray
        lines={lines}
        count={count}
        totalKobo={totalKobo}
        tableNo={tableNo}
        onTableNo={setTableNo}
        onSubmit={submit}
        submitting={submitting}
        error={error}
        placed={placed}
      />
    </div>
  );
}
