"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useDesignStore } from "@/stores/designStore";
import { formatPrice, calculateBulkPrice } from "@/lib/utils";
import {
  Type, Image as ImageIcon, Square, RotateCcw, RotateCw,
  Trash2, Download, ShoppingCart, ChevronLeft, Loader2,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Plus, Minus, Upload, Copy,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string; name: string; slug: string; basePrice: number; category: string;
  mockupImage: string; images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[]; minQuantity: number;
  bulkPricing: { minQty: number; pricePerUnit: number }[] | null;
}

type Tool = "select" | "text" | "shape" | "upload";

export default function DesignToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<{ canvas: unknown; fabric: unknown } | null>(null);
  const addItem = useCartStore(s => s.addItem);
  const {
    canvasJson, setCanvasJson, previewUrl, setPreviewUrl,
    pushUndo, undo, redo, setCurrentProduct
  } = useDesignStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [textInput, setTextInput] = useState("Your Text");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#111827");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textAlign, setTextAlign] = useState("center");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [printSide, setPrintSide] = useState("front");
  const [uploadingImg, setUploadingImg] = useState(false);

  // Load product
  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.product) {
          setProduct(d.product);
          setSelectedColor(d.product.colors?.[0] ?? null);
          setSelectedSize(d.product.sizes?.[0] ?? "");
          setQuantity(d.product.minQuantity ?? 1);
          setCurrentProduct(d.product.slug);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, setCurrentProduct]);

  // Initialize Fabric.js
  useEffect(() => {
    if (!product || fabricLoaded) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("fabric").then((mod: any) => {
      if (!canvasRef.current) return;
      // fabric v5 exports are either direct or under .fabric namespace
      const F = mod.fabric ?? mod;
      const canvas = new F.Canvas(canvasRef.current, {
        width: 400,
        height: 400,
        backgroundColor: "#ffffff",
        selection: true,
      });

      fabricRef.current = { canvas, fabric: F };
      setFabricLoaded(true);

      // Load saved JSON
      if (canvasJson) {
        canvas.loadFromJSON(canvasJson, () => canvas.renderAll());
      }

      // Track changes for undo
      canvas.on("object:modified", () => {
        const json = JSON.stringify(canvas.toJSON());
        setCanvasJson(json);
        pushUndo(json);
      });

      canvas.on("object:added", () => {
        const json = JSON.stringify(canvas.toJSON());
        setCanvasJson(json);
      });
    });

    return () => {
      if (fabricRef.current) {
        (fabricRef.current.canvas as { dispose?: () => void }).dispose?.();
        fabricRef.current = null;
      }
    };
  }, [product, fabricLoaded]);

  function addText() {
    if (!fabricRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { canvas, fabric: F } = fabricRef.current as any;
    const text = new F.IText(textInput || "Your Text", {
      left: 150, top: 150, fontSize, fontWeight, fontStyle,
      textAlign, fill: fontColor, fontFamily: "Arial",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }

  function addRect() {
    if (!fabricRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { canvas, fabric: F } = fabricRef.current as any;
    const rect = new F.Rect({
      left: 100, top: 100, width: 100, height: 100,
      fill: "transparent", stroke: fontColor, strokeWidth: 2,
    });
    canvas.add(rect);
    canvas.renderAll();
  }

  function deleteSelected() {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current.canvas as { getActiveObject: () => unknown; remove: (obj: unknown) => void; renderAll: () => void };
    const obj = canvas.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  }

  function handleUndo() {
    const prev = undo();
    if (prev && fabricRef.current) {
      const canvas = fabricRef.current.canvas as { loadFromJSON: (json: string, cb: () => void) => void; renderAll: () => void };
      canvas.loadFromJSON(prev, () => canvas.renderAll());
    }
  }

  function handleRedo() {
    const next = redo();
    if (next && fabricRef.current) {
      const canvas = fabricRef.current.canvas as { loadFromJSON: (json: string, cb: () => void) => void; renderAll: () => void };
      canvas.loadFromJSON(next, () => canvas.renderAll());
    }
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "printora/designs");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.url) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import("fabric");
      const F = mod.fabric ?? mod;
      const img = await F.Image.fromURL(data.url, { crossOrigin: "anonymous" });
      img.scaleToWidth(200);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = fabricRef.current.canvas as any;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleAddToCart() {
    if (!product || !fabricRef.current) return;
    setSaving(true);
    try {
      const canvas = fabricRef.current.canvas as { toDataURL: (opts: unknown) => string; toJSON: () => unknown };
      const dataUrl = canvas.toDataURL({ format: "png", quality: 0.9, multiplier: 2 });
      const json = JSON.stringify(canvas.toJSON());
      setCanvasJson(json);

      // Upload preview
      let uploadedPreviewUrl = "";
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const fd = new FormData();
        fd.append("file", blob, "design-preview.png");
        fd.append("folder", "printora/previews");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        uploadedPreviewUrl = data.url ?? "";
        setPreviewUrl(uploadedPreviewUrl);
      } catch { /* continue without preview */ }

      const unitPrice = calculateBulkPrice(product.basePrice, quantity, product.bulkPricing ?? null);

      addItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        image: uploadedPreviewUrl || product.images[0] || "",
        color: selectedColor?.name,
        size: selectedSize || undefined,
        quantity,
        unitPrice,
        designUrl: uploadedPreviewUrl,
        previewUrl: uploadedPreviewUrl,
        designData: json,
        printSide,
      });

      setSaved(true);
      setTimeout(() => { setSaved(false); router.push("/cart"); }, 1200);
    } finally {
      setSaving(false);
    }
  }

  const unitPrice = product ? calculateBulkPrice(product.basePrice, quantity, product.bulkPricing ?? null) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-[#6B7280] mb-4">Product not found.</p>
        <Link href="/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col">
      {/* Topbar */}
      <div className="bg-[#1F2937] border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <Link href={`/products/${slug}`} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
            Designing: {product.name}
          </h1>
        </div>

        {/* Print side */}
        <div className="hidden sm:flex gap-1 bg-white/5 rounded-lg p-1">
          {["front", "back"].map(side => (
            <button
              key={side}
              onClick={() => setPrintSide(side)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${printSide === side ? "bg-[#7C3AED] text-white" : "text-gray-400 hover:text-white"}`}
            >
              {side}
            </button>
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button onClick={handleUndo} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={handleRedo} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={deleteSelected} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart */}
        <button
          id="design-add-to-cart"
          onClick={handleAddToCart}
          disabled={saving}
          className={`btn-primary btn-sm flex-shrink-0 ${saved ? "!bg-green-600" : ""}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {saved ? "Added!" : saving ? "Saving…" : `Add to Cart — ${formatPrice(unitPrice * quantity)}`}
        </button>
      </div>

      {/* Main editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="w-14 bg-[#1F2937] border-r border-white/10 flex flex-col items-center py-4 gap-2">
          {[
            { tool: "select" as Tool, icon: "↖", label: "Select" },
            { tool: "text" as Tool, icon: <Type className="w-5 h-5" />, label: "Text" },
            { tool: "shape" as Tool, icon: <Square className="w-5 h-5" />, label: "Shape" },
            { tool: "upload" as Tool, icon: <Upload className="w-5 h-5" />, label: "Upload" },
          ].map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm transition-colors ${activeTool === tool ? "bg-[#7C3AED] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#111827]">
          <div className="relative">
            {/* Mock product behind canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <div className="text-[200px]">
                {product.category === "TSHIRT" ? "👕" : product.category === "MUG" ? "☕" : "🖨️"}
              </div>
            </div>

            <div className="relative z-10">
              {/* Dashed print boundary */}
              <div className="absolute -inset-2 border-2 border-dashed border-[#7C3AED]/30 rounded pointer-events-none" />
              <canvas ref={canvasRef} className="rounded-lg shadow-2xl" />
            </div>

            {!fabricLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
              </div>
            )}
          </div>
        </div>

        {/* Right properties panel */}
        <div className="w-64 bg-[#1F2937] border-l border-white/10 p-4 overflow-y-auto">
          {/* Tool-specific controls */}
          {activeTool === "text" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm">Add Text</h3>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Text</label>
                <input
                  type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                  className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-[#7C3AED] outline-none"
                  placeholder="Enter text…"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Font Size: {fontSize}px</label>
                <input type="range" min={10} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-[#7C3AED]" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-white text-xs font-mono">{fontColor}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setFontWeight(w => w === "bold" ? "normal" : "bold")} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${fontWeight === "bold" ? "bg-[#7C3AED] text-white" : "bg-white/10 text-gray-400 hover:text-white"}`}>
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => setFontStyle(s => s === "italic" ? "normal" : "italic")} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${fontStyle === "italic" ? "bg-[#7C3AED] text-white" : "bg-white/10 text-gray-400 hover:text-white"}`}>
                  <Italic className="w-4 h-4" />
                </button>
                {["left","center","right"].map(a => (
                  <button key={a} onClick={() => setTextAlign(a)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${textAlign === a ? "bg-[#7C3AED] text-white" : "bg-white/10 text-gray-400 hover:text-white"}`}>
                    {a === "left" ? <AlignLeft className="w-4 h-4" /> : a === "center" ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <button onClick={addText} className="btn-primary w-full btn-sm">
                <Type className="w-4 h-4" /> Add Text
              </button>
            </div>
          )}

          {activeTool === "shape" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm">Add Shape</h3>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Stroke Color</label>
                <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              </div>
              <button onClick={addRect} className="btn-primary w-full btn-sm">
                <Square className="w-4 h-4" /> Add Rectangle
              </button>
            </div>
          )}

          {activeTool === "upload" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm">Upload Image</h3>
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-white/20 rounded-xl p-5 cursor-pointer hover:border-[#7C3AED] transition-colors">
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                {uploadingImg ? <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" /> : <Upload className="w-6 h-6 text-gray-400" />}
                <p className="text-xs text-gray-400 text-center">{uploadingImg ? "Uploading…" : "Click to upload PNG, JPG"}</p>
              </label>
            </div>
          )}

          {/* Product options */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
            <h3 className="text-white font-semibold text-sm">Product Options</h3>

            {product.colors.length > 0 && (
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map(c => (
                    <button
                      key={c.hex} onClick={() => setSelectedColor(c)} title={c.name}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor?.hex === c.hex ? "border-[#7C3AED] scale-110" : "border-transparent hover:scale-105"}`}
                      style={{ background: c.hex, outlineOffset: "2px", outline: selectedColor?.hex === c.hex ? "2px solid #7C3AED" : "none" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Size</label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(size => (
                    <button
                      key={size} onClick={() => setSelectedSize(size)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedSize === size ? "bg-[#7C3AED] text-white" : "bg-white/10 text-gray-400 hover:text-white"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-gray-400 text-xs mb-2 block">Quantity {product.minQuantity > 1 && `(min ${product.minQuantity})`}</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(q => Math.max(product.minQuantity, q - 1))} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-white font-semibold w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{formatPrice(unitPrice)} × {quantity}</span>
              </div>
              <p className="text-white font-bold text-lg">{formatPrice(unitPrice * quantity)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
