import React, { useRef, useState } from 'react';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { ColorPicker } from '../ui/ColorPicker';
import type { ConfigData } from '../../services/configService';
import { X } from 'lucide-react';

interface SplashSettingsProps {
  data: ConfigData;
  onChange: (field: keyof ConfigData, value: any) => void;
  onFileChange: (field: keyof ConfigData, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove?: (field: keyof ConfigData) => void;
}

type ButtonShape = 'rounded' | 'pill' | 'square';
type ButtonType = 'text' | 'icon';

interface SplashButton {
  id: string;
  type: ButtonType;
  text: string;
  url: string;
  icon_url: string;
  bg_color: string;
  text_color: string;
  shape: ButtonShape;
  x: number;
  y: number;
  width: number;
  height: number;
  font_family: string;
}

interface SplashExtra {
  use_gradient: boolean;
  top_bar_enabled: boolean;
  top_bar_text: string;
  top_bar_color: string;
  top_bar_text_color: string;
  top_bar_height: number;
  top_bar_width: number;
  top_bar_font_family: string;
  icon_enabled: boolean;
  icon_url: string;
  icon_size: number;
  icon_x: number;
  icon_y: number;
  title: string;
  title_size: number;
  title_x: number;
  title_y: number;
  title_font_family: string;
  subtitle: string;
  subtitle_size: number;
  subtitle_x: number;
  subtitle_y: number;
  subtitle_font_family: string;
  show_skip_button: boolean;
  skip_button_text: string;
  skip_button_color: string;
  skip_button_text_color: string;
  skip_button_x: number;
  skip_button_y: number;
  skip_button_font_family: string;
  image_fit: 'cover' | 'contain' | 'fill';
  image_position_y: 'top' | 'center' | 'bottom';
  image_blur: number;
  image_brightness: number;
  image_contrast: number;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  gradient_overlay_enabled: boolean;
  gradient_overlay_color_start: string;
  gradient_overlay_color_end: string;
  gradient_overlay_opacity: number;
  gradient_overlay_direction: 'to-bottom' | 'to-top' | 'to-left' | 'to-right';
}

const DEFAULT_EXTRA: SplashExtra = {
  use_gradient: true,
  top_bar_enabled: false,
  top_bar_text: '',
  top_bar_color: '#000000',
  top_bar_text_color: '#FFFFFF',
  top_bar_height: 6,
  top_bar_width: 100,
  top_bar_font_family: 'Inter',
  icon_enabled: false,
  icon_url: '',
  icon_size: 80,
  icon_x: 50,
  icon_y: 15,
  title: 'Kewoz Pro',
  title_size: 48,
  title_x: 50,
  title_y: 45,
  title_font_family: 'Inter',
  subtitle: '',
  subtitle_size: 22,
  subtitle_x: 50,
  subtitle_y: 55,
  subtitle_font_family: 'Inter',
  show_skip_button: true,
  skip_button_text: 'Saltar',
  skip_button_color: '#FFFFFF',
  skip_button_text_color: '#000000',
  skip_button_x: 92,
  skip_button_y: 6,
  skip_button_font_family: 'Inter',
  image_fit: 'cover',
  image_position_y: 'center',
  image_blur: 0,
  image_brightness: 100,
  image_contrast: 100,
  overlay_enabled: false,
  overlay_color: '#000000',
  overlay_opacity: 50,
  gradient_overlay_enabled: false,
  gradient_overlay_color_start: '#000000',
  gradient_overlay_color_end: 'rgba(0,0,0,0)',
  gradient_overlay_opacity: 60,
  gradient_overlay_direction: 'to-top',
};

const FONT_OPTIONS = [
  { name: 'Inter', weight: 400 },
  { name: 'Roboto', weight: 400 },
  { name: 'Montserrat', weight: 400 },
  { name: 'Poppins', weight: 400 },
  { name: 'Playfair Display', weight: 400 },
  { name: 'Bebas Neue', weight: 400 },
  { name: 'Oswald', weight: 400 },
  { name: 'Raleway', weight: 400 },
  { name: 'Lato', weight: 400 },
  { name: 'Open Sans', weight: 400 },
];

function parseButtons(raw: string | undefined): SplashButton[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

function parseExtra(raw: string | undefined): SplashExtra {
  if (!raw) return { ...DEFAULT_EXTRA };
  try {
    const obj = JSON.parse(raw);
    return { ...DEFAULT_EXTRA, ...obj };
  } catch {
    return { ...DEFAULT_EXTRA };
  }
}

const uid = () => Math.random().toString(36).slice(2, 9);

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
  containerW: number;
  containerH: number;
}

type Selectable =
  | { kind: 'icon' }
  | { kind: 'title' }
  | { kind: 'subtitle' }
  | { kind: 'topbar' }
  | { kind: 'skip' }
  | { kind: 'button'; id: string };

type ResizeCorner = 'br' | 'bl' | 'tr' | 'tl';

export const SplashSettings: React.FC<SplashSettingsProps> = ({
  data,
  onChange,
  onFileChange,
  onFileRemove,
}) => {
  const splashFileRef = useRef<HTMLInputElement>(null);
  const splashMobileFileRef = useRef<HTMLInputElement>(null);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const buttonIconRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const previewMobileRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Selectable | null>(null);
  const dragRef = useRef<{
    state: DragState;
    sel: Selectable;
    kind: 'move' | ResizeCorner;
  } | null>(null);

  // Cleanup any lingering global listeners on unmount
  React.useEffect(() => {
    return () => {
      // Clear dragRef on unmount
      dragRef.current = null;
    };
  }, []);

  const enabled = data.splash_enabled === true || data.splash_enabled === 'true';
  const mode = data.splash_mode || 'template';
  const duration = typeof data.splash_duration === 'number' ? data.splash_duration : 4;

  const buttons = parseButtons(data.splash_buttons);
  const extra = parseExtra(data.splash_extra);

  // Use splash_title / splash_subtitle as primary source if set, else from extra.
  // Empty string is a valid value (user cleared it) — only fall back when truly undefined/null.
  // In image mode the default title is empty (not "Kewoz Pro").
  const mergedExtra: SplashExtra = {
    ...extra,
    title:
      data.splash_title !== undefined && data.splash_title !== null
        ? data.splash_title
        : mode === 'image'
        ? ''
        : extra.title,
    subtitle:
      data.splash_subtitle !== undefined && data.splash_subtitle !== null
        ? data.splash_subtitle
        : extra.subtitle,
  };

  const imageForDesktop = data.splash_image;
  const imageForMobile = data.splash_image_mobile || data.splash_image;

  const persistButtons = (next: SplashButton[]) => {
    onChange('splash_buttons', JSON.stringify(next));
  };

  const persistExtra = (patch: Partial<SplashExtra>) => {
    const next = { ...mergedExtra, ...patch };
    // Sync title/subtitle to top-level fields for backwards compat
    onChange('splash_title', next.title);
    onChange('splash_subtitle', next.subtitle);
    const { title: _t, subtitle: _s, ...rest } = next;
    onChange('splash_extra', JSON.stringify(rest));
  };

  const handleModeToggle = (nextMode: 'template' | 'image') => {
    onChange('splash_mode', nextMode);
  };

  const addButton = () => {
    const newBtn: SplashButton = {
      id: uid(),
      type: 'text',
      text: 'Botón',
      url: '',
      icon_url: '',
      bg_color: '#FFFFFF',
      text_color: '#000000',
      shape: 'rounded',
      x: 50,
      y: 75,
      width: 20,
      height: 8,
      font_family: 'Inter',
    };
    persistButtons([...buttons, newBtn]);
    setSelected({ kind: 'button', id: newBtn.id });
  };

  const updateButton = (id: string, patch: Partial<SplashButton>) => {
    persistButtons(buttons.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeButton = (id: string) => {
    persistButtons(buttons.filter((b) => b.id !== id));
    if (selected && selected.kind === 'button' && selected.id === id) {
      setSelected(null);
    }
  };

  // === Drag / Resize logic ===
  const beginDrag = (
    e: React.MouseEvent,
    sel: Selectable,
    kind: 'move' | ResizeCorner,
    current: { x: number; y: number; w?: number; h?: number }
  ) => {
    e.stopPropagation();
    setSelected(sel);
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    // Clean up any prior drag state
    if (dragRef.current) {
      dragRef.current = null;
    }
    dragRef.current = {
      state: {
        startX: e.clientX,
        startY: e.clientY,
        origX: current.x,
        origY: current.y,
        origW: current.w ?? 0,
        origH: current.h ?? 0,
        containerW: rect.width,
        containerH: rect.height,
      },
      sel,
      kind,
    };

    const onMove = (ev: MouseEvent) => {
      const ds = dragRef.current;
      if (!ds) return;
      const dxPct = ((ev.clientX - ds.state.startX) / ds.state.containerW) * 100;
      const dyPct = ((ev.clientY - ds.state.startY) / ds.state.containerH) * 100;

      if (ds.kind === 'move') {
        const newX = Math.max(0, Math.min(100, ds.state.origX + dxPct));
        const newY = Math.max(0, Math.min(100, ds.state.origY + dyPct));
        applyMove(ds.sel, newX, newY);
      } else {
        let dW = dxPct;
        let dH = dyPct;
        if (ds.kind === 'tl') {
          dW = -dxPct;
          dH = -dyPct;
        } else if (ds.kind === 'tr') {
          dW = dxPct;
          dH = -dyPct;
        } else if (ds.kind === 'bl') {
          dW = -dxPct;
          dH = dyPct;
        }
        const newW = Math.max(2, Math.min(100, ds.state.origW + dW));
        const newH = Math.max(2, Math.min(100, ds.state.origH + dH));
        applyResize(ds.sel, newW, newH);
      }
    };

    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const applyMove = (sel: Selectable, x: number, y: number) => {
    if (sel.kind === 'icon') persistExtra({ icon_x: x, icon_y: y });
    else if (sel.kind === 'title') persistExtra({ title_x: x, title_y: y });
    else if (sel.kind === 'subtitle') persistExtra({ subtitle_x: x, subtitle_y: y });
    else if (sel.kind === 'skip') persistExtra({ skip_button_x: x, skip_button_y: y });
    else if (sel.kind === 'topbar') {
      persistExtra({ top_bar_width: Math.max(10, Math.min(100, x)) });
    } else if (sel.kind === 'button') {
      updateButton(sel.id, { x, y });
    }
  };

  const applyResize = (sel: Selectable, w: number, h: number) => {
    if (sel.kind === 'icon') {
      const newSize = Math.round(w * 4);
      persistExtra({ icon_size: Math.max(20, Math.min(400, newSize)) });
    } else if (sel.kind === 'title') {
      persistExtra({ title_size: Math.round(h * 2.5) });
    } else if (sel.kind === 'subtitle') {
      persistExtra({ subtitle_size: Math.round(h * 2) });
    } else if (sel.kind === 'topbar') {
      persistExtra({
        top_bar_width: Math.round(w),
        top_bar_height: Math.round(h),
      });
    } else if (sel.kind === 'button') {
      updateButton(sel.id, { width: Math.round(w), height: Math.round(h) });
    } else if (sel.kind === 'skip') {
      // Skip button: width=position-X, height is not really meaningful
    }
  };

  const isSelected = (sel: Selectable): boolean => {
    if (!selected) return false;
    if (selected.kind !== sel.kind) return false;
    if (sel.kind === 'button' && selected.kind === 'button') {
      return sel.id === selected.id;
    }
    return true;
  };

  const renderHandles = (
    sel: Selectable,
    current: { x: number; y: number; w?: number; h?: number }
  ) => {
    if (!isSelected(sel)) return null;

    const corners: ResizeCorner[] = ['tl', 'tr', 'bl', 'br'];

    return (
      <>
        <div
          onMouseDown={(e) => beginDrag(e, sel, 'move', current)}
          style={{
            position: 'absolute',
            inset: 0,
            outline: '2px dashed #3b82f6',
            outlineOffset: '-2px',
            cursor: 'move',
          }}
        />
        {corners.map((corner) => {
          const style: React.CSSProperties = {
            position: 'absolute',
            width: '14px',
            height: '14px',
            background: '#3b82f6',
            border: '2px solid #fff',
            borderRadius: '50%',
            zIndex: 50,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          };
          if (corner === 'tl') {
            style.top = '-8px';
            style.left = '-8px';
            style.cursor = 'nwse-resize';
          } else if (corner === 'tr') {
            style.top = '-8px';
            style.right = '-8px';
            style.cursor = 'nesw-resize';
          } else if (corner === 'bl') {
            style.bottom = '-8px';
            style.left = '-8px';
            style.cursor = 'nesw-resize';
          } else if (corner === 'br') {
            style.bottom = '-8px';
            style.right = '-8px';
            style.cursor = 'nwse-resize';
          }
          return (
            <div
              key={corner}
              onMouseDown={(e) => beginDrag(e, sel, corner, current)}
              style={style}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold text-table-header-text">
          Configurar Interstitial / Banner
        </h3>
        <Toggle
          id="splash_enabled"
          checked={enabled}
          onChange={(checked) => onChange('splash_enabled', checked)}
          label="Activar"
        />
      </div>

      {!enabled && (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-text-muted text-sm">
          Activa el toggle para configurar el interstitial.
        </div>
      )}

      {enabled && (
        <>
          {/* Mode Tabs with mutual exclusion */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${
                mode === 'template'
                  ? 'border-primary-dark bg-primary-dark text-button-text'
                  : 'border-table-divider bg-white'
              }`}
            >
              <div>
                <div className="text-sm font-bold">Modo Plantilla</div>
                <div className="text-xs opacity-80">Texto + colores</div>
              </div>
              <Toggle
                id="mode_template"
                checked={mode === 'template'}
                onChange={(c) => c && handleModeToggle('template')}
                label=""
              />
            </div>
            <div
              className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${
                mode === 'image'
                  ? 'border-primary-dark bg-primary-dark text-button-text'
                  : 'border-table-divider bg-white'
              }`}
            >
              <div>
                <div className="text-sm font-bold">Modo Imagen</div>
                <div className="text-xs opacity-80">Imagen de fondo</div>
              </div>
              <Toggle
                id="mode_image"
                checked={mode === 'image'}
                onChange={(c) => c && handleModeToggle('image')}
                label=""
              />
            </div>
          </div>

          {/* Duration */}
          <div className="border border-table-divider p-4 rounded-lg bg-white">
            <label className="block text-sm font-medium text-text-muted mb-2">
              Duración (segundos)
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={duration}
              onChange={(e) => onChange('splash_duration', parseInt(e.target.value, 10) || 1)}
              className="w-32 border border-table-divider"
            />
          </div>

          {/* === Background === */}
          {mode === 'template' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-table-header-text">Fondo</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Degradado</span>
                  <Toggle
                    id="use_gradient"
                    checked={mergedExtra.use_gradient}
                    onChange={(c) => persistExtra({ use_gradient: c })}
                    label=""
                  />
                </div>
              </div>
              {mergedExtra.use_gradient ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Color inicio</label>
                    <ColorPicker
                      value={data.splash_bg_color || '#1A0033'}
                      onChange={(v) => onChange('splash_bg_color', v)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Color fin</label>
                    <ColorPicker
                      value={data.splash_bg_color_end || '#3D0066'}
                      onChange={(v) => onChange('splash_bg_color_end', v)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-text-muted mb-1">Color de fondo</label>
                  <ColorPicker
                    value={data.splash_bg_color || '#1A0033'}
                    onChange={(v) => {
                      onChange('splash_bg_color', v);
                      onChange('splash_bg_color_end', v);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* === Top Bar === */}
          {mode === 'template' && (
          <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-table-header-text">Barra superior</h4>
              <Toggle
                id="top_bar_enabled"
                checked={mergedExtra.top_bar_enabled}
                onChange={(c) => persistExtra({ top_bar_enabled: c })}
                label="Activar"
              />
            </div>
            {mergedExtra.top_bar_enabled && (
              <>
                <Field label="Texto">
                  <Input
                    value={mergedExtra.top_bar_text}
                    onChange={(e) => persistExtra({ top_bar_text: e.target.value })}
                    placeholder="Oferta especial"
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Row>
                  <Field label="Ancho (%)">
                    <Input
                      type="number"
                      min={10}
                      max={100}
                      value={Math.round(mergedExtra.top_bar_width)}
                      onChange={(e) =>
                        persistExtra({ top_bar_width: parseInt(e.target.value, 10) || 100 })
                      }
                      className="w-full border border-table-divider"
                    />
                  </Field>
                  <Field label="Alto (%)">
                    <Input
                      type="number"
                      min={2}
                      max={30}
                      value={Math.round(mergedExtra.top_bar_height)}
                      onChange={(e) =>
                        persistExtra({ top_bar_height: parseInt(e.target.value, 10) || 6 })
                      }
                      className="w-full border border-table-divider"
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Color fondo">
                    <ColorPicker
                      value={mergedExtra.top_bar_color}
                      onChange={(v) => persistExtra({ top_bar_color: v })}
                    />
                  </Field>
                  <Field label="Color texto">
                    <ColorPicker
                      value={mergedExtra.top_bar_text_color}
                      onChange={(v) => persistExtra({ top_bar_text_color: v })}
                    />
                  </Field>
                </Row>
                <Field label="Fuente">
                  <FontSelect
                    value={mergedExtra.top_bar_font_family}
                    onChange={(v) => persistExtra({ top_bar_font_family: v })}
                  />
                </Field>
              </>
            )}
          </div>
          )}

          {/* === Image Mode Background === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-bold text-table-header-text">Imagen de fondo</h4>
              <div>
                <input
                  ref={splashFileRef}
                  type="file"
                  id="splash_image_upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange('splash_image', e)}
                />
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="splash_image_upload"
                    className="px-3 py-2 text-sm bg-gray-100 border border-table-divider rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    Choose File
                  </label>
                  <span className="text-xs text-text-muted truncate max-w-[200px]">
                    {data.splash_image
                      ? data.splash_image.startsWith('blob:')
                        ? 'Nueva imagen seleccionada'
                        : data.splash_image.split('/').pop() || 'Imagen actual'
                      : 'No file chosen'}
                  </span>
                </div>
              </div>
              <Field label="URL al hacer click (opcional)">
                <Input
                  value={data.splash_click_url || ''}
                  onChange={(e) => onChange('splash_click_url', e.target.value)}
                  placeholder="https://ejemplo.com/promo"
                  className="w-full border border-table-divider"
                />
              </Field>
            </div>
          )}

          {/* === Imagen Mobile (solo modo imagen) === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-table-header-text">Imagen Mobile (opcional)</h4>
                  <p className="text-[11px] text-text-muted mt-1">
                    Recomendado: 1080×1920 (9:16 vertical). Si no subes una, se usa la misma imagen de escritorio en celulares.
                  </p>
                </div>
              </div>
              <div>
                <input
                  ref={splashMobileFileRef}
                  type="file"
                  id="splash_image_mobile_upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange('splash_image_mobile', e)}
                />
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="splash_image_mobile_upload"
                    className="px-3 py-2 text-sm bg-gray-100 border border-table-divider rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    Choose File
                  </label>
                  <span className="text-xs text-text-muted truncate max-w-[200px]">
                    {data.splash_image_mobile
                      ? data.splash_image_mobile.startsWith('blob:')
                        ? 'Nueva imagen seleccionada'
                        : data.splash_image_mobile.split('/').pop() || 'Imagen actual'
                      : 'No file chosen'}
                  </span>
                  {data.splash_image_mobile && (
                    <button
                      type="button"
                      onClick={() => onFileRemove && onFileRemove('splash_image_mobile')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === Image: Ajuste (fit + position) === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-bold text-table-header-text">Ajuste de imagen</h4>
              <Field label="Modo de ajuste">
                <div className="grid grid-cols-3 gap-2">
                  {(['cover', 'contain', 'fill'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => persistExtra({ image_fit: fit })}
                      className={`py-2 text-xs rounded border transition-colors ${
                        mergedExtra.image_fit === fit
                          ? 'bg-primary-dark text-button-text border-primary-dark'
                          : 'bg-white border-table-divider text-table-header-text hover:bg-table-row-hover'
                      }`}
                    >
                      {fit === 'cover' ? 'Cover' : fit === 'contain' ? 'Contain' : 'Fill'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted mt-1">
                  {mergedExtra.image_fit === 'cover'
                    ? 'Recorta para llenar todo el área.'
                    : mergedExtra.image_fit === 'contain'
                    ? 'La imagen completa se ve; puede dejar bandas vacías.'
                    : 'Estira la imagen para llenar el área (puede deformar).'}
                </p>
              </Field>
              <Field label="Posición vertical">
                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'center', 'bottom'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => persistExtra({ image_position_y: p })}
                      className={`py-2 text-xs rounded border transition-colors ${
                        mergedExtra.image_position_y === p
                          ? 'bg-primary-dark text-button-text border-primary-dark'
                          : 'bg-white border-table-divider text-table-header-text hover:bg-table-row-hover'
                      }`}
                    >
                      {p === 'top' ? 'Arriba' : p === 'center' ? 'Centro' : 'Abajo'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* === Image: Filtros (blur, brightness, contrast) === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-bold text-table-header-text">Filtros de imagen</h4>
              <Field label={`Desenfoque (${mergedExtra.image_blur}px)`}>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={mergedExtra.image_blur}
                  onChange={(e) =>
                    persistExtra({ image_blur: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Brillo (${mergedExtra.image_brightness}%)`}>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={mergedExtra.image_brightness}
                  onChange={(e) =>
                    persistExtra({ image_brightness: parseInt(e.target.value, 10) || 100 })
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Contraste (${mergedExtra.image_contrast}%)`}>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={mergedExtra.image_contrast}
                  onChange={(e) =>
                    persistExtra({ image_contrast: parseInt(e.target.value, 10) || 100 })
                  }
                  className="w-full"
                />
              </Field>
            </div>
          )}

          {/* === Image: Overlay oscuro === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-table-header-text">Overlay oscuro</h4>
                <Toggle
                  id="overlay_enabled"
                  checked={mergedExtra.overlay_enabled}
                  onChange={(c) => persistExtra({ overlay_enabled: c })}
                  label="Activar"
                />
              </div>
              {mergedExtra.overlay_enabled && (
                <>
                  <Field label="Color de superposición">
                    <ColorPicker
                      value={mergedExtra.overlay_color}
                      onChange={(v) => persistExtra({ overlay_color: v })}
                    />
                  </Field>
                  <Field label={`Opacidad (${mergedExtra.overlay_opacity}%)`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mergedExtra.overlay_opacity}
                      onChange={(e) =>
                        persistExtra({ overlay_opacity: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full"
                    />
                  </Field>
                </>
              )}
            </div>
          )}

          {/* === Image: Overlay degradado === */}
          {mode === 'image' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-table-header-text">Overlay degradado</h4>
                <Toggle
                  id="gradient_overlay_enabled"
                  checked={mergedExtra.gradient_overlay_enabled}
                  onChange={(c) => persistExtra({ gradient_overlay_enabled: c })}
                  label="Activar"
                />
              </div>
              {mergedExtra.gradient_overlay_enabled && (
                <>
                  <Field label="Dirección">
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['to-top', 'to-bottom', 'to-left', 'to-right'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => persistExtra({ gradient_overlay_direction: d })}
                          className={`py-1.5 text-[11px] rounded border transition-colors ${
                            mergedExtra.gradient_overlay_direction === d
                              ? 'bg-primary-dark text-button-text border-primary-dark'
                              : 'bg-white border-table-divider text-table-header-text hover:bg-table-row-hover'
                          }`}
                        >
                          {d === 'to-top' ? '↑' : d === 'to-bottom' ? '↓' : d === 'to-left' ? '←' : '→'}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Row>
                    <Field label="Color inicio">
                      <ColorPicker
                        value={mergedExtra.gradient_overlay_color_start}
                        onChange={(v) => persistExtra({ gradient_overlay_color_start: v })}
                      />
                    </Field>
                    <Field label="Color fin">
                      <ColorPicker
                        value={mergedExtra.gradient_overlay_color_end}
                        onChange={(v) => persistExtra({ gradient_overlay_color_end: v })}
                      />
                    </Field>
                  </Row>
                  <Field label={`Opacidad (${mergedExtra.gradient_overlay_opacity}%)`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mergedExtra.gradient_overlay_opacity}
                      onChange={(e) =>
                        persistExtra({
                          gradient_overlay_opacity: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full"
                    />
                  </Field>
                </>
              )}
            </div>
          )}

          {/* === Logo / Icon === */}
          {mode === 'template' && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-table-header-text">Logo / Icono</h4>
                <Toggle
                  id="icon_enabled"
                  checked={mergedExtra.icon_enabled}
                  onChange={(c) => persistExtra({ icon_enabled: c })}
                  label="Activar"
                />
              </div>
              {mergedExtra.icon_enabled && (
                <>
                  <Field label="Imagen">
                    <input
                      ref={iconFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="icon_upload_field"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            persistExtra({ icon_url: ev.target?.result as string });
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="icon_upload_field"
                        className="px-3 py-1.5 text-sm bg-gray-100 border border-table-divider rounded-md cursor-pointer hover:bg-gray-200"
                      >
                        Subir imagen
                      </label>
                      {mergedExtra.icon_url && (
                        <button
                          type="button"
                          onClick={() => persistExtra({ icon_url: '' })}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </Field>
                  <Row>
                    <Field label="Tamaño (px)">
                      <Input
                        type="number"
                        min={20}
                        max={400}
                        value={mergedExtra.icon_size}
                        onChange={(e) =>
                          persistExtra({ icon_size: parseInt(e.target.value, 10) || 80 })
                        }
                        className="w-full border border-table-divider"
                      />
                    </Field>
                    <Field label="Pos. X (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(mergedExtra.icon_x)}
                        onChange={(e) => persistExtra({ icon_x: parseInt(e.target.value, 10) || 50 })}
                        className="w-full border border-table-divider"
                      />
                    </Field>
                    <Field label="Pos. Y (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(mergedExtra.icon_y)}
                        onChange={(e) => persistExtra({ icon_y: parseInt(e.target.value, 10) || 15 })}
                        className="w-full border border-table-divider"
                      />
                    </Field>
                  </Row>
                  <p className="text-xs text-text-muted italic">
                    💡 O click en el logo dentro del preview para moverlo y redimensionarlo
                  </p>
                </>
              )}
            </div>
          )}

          {/* === Title === */}
          {(mode === 'template' || mode === 'image') && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-bold text-table-header-text">Título</h4>
              <Field label="Texto">
                <Input
                  value={mergedExtra.title}
                  onChange={(e) => persistExtra({ title: e.target.value })}
                  placeholder="Kewoz Pro"
                  className="w-full border border-table-divider"
                />
              </Field>
              <Row>
                <Field label="Tamaño (px)">
                  <Input
                    type="number"
                    min={12}
                    max={120}
                    value={mergedExtra.title_size}
                    onChange={(e) => persistExtra({ title_size: parseInt(e.target.value, 10) || 48 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Field label="Pos. X (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(mergedExtra.title_x)}
                    onChange={(e) => persistExtra({ title_x: parseInt(e.target.value, 10) || 50 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Field label="Pos. Y (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(mergedExtra.title_y)}
                    onChange={(e) => persistExtra({ title_y: parseInt(e.target.value, 10) || 45 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
              </Row>
              <Field label="Fuente">
                <FontSelect
                  value={mergedExtra.title_font_family}
                  onChange={(v) => persistExtra({ title_font_family: v })}
                />
              </Field>
            </div>
          )}

          {/* === Subtitle === */}
          {(mode === 'template' || mode === 'image') && (
            <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
              <h4 className="text-sm font-bold text-table-header-text">Subtítulo</h4>
              <Field label="Texto">
                <Input
                  value={mergedExtra.subtitle}
                  onChange={(e) => persistExtra({ subtitle: e.target.value })}
                  placeholder="La mejor experiencia de chat"
                  className="w-full border border-table-divider"
                />
              </Field>
              <Row>
                <Field label="Tamaño (px)">
                  <Input
                    type="number"
                    min={10}
                    max={80}
                    value={mergedExtra.subtitle_size}
                    onChange={(e) => persistExtra({ subtitle_size: parseInt(e.target.value, 10) || 22 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Field label="Pos. X (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(mergedExtra.subtitle_x)}
                    onChange={(e) => persistExtra({ subtitle_x: parseInt(e.target.value, 10) || 50 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Field label="Pos. Y (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(mergedExtra.subtitle_y)}
                    onChange={(e) => persistExtra({ subtitle_y: parseInt(e.target.value, 10) || 55 })}
                    className="w-full border border-table-divider"
                  />
                </Field>
              </Row>
              <Field label="Fuente">
                <FontSelect
                  value={mergedExtra.subtitle_font_family}
                  onChange={(v) => persistExtra({ subtitle_font_family: v })}
                />
              </Field>
            </div>
          )}

          {/* === Skip Button === */}
          <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-table-header-text">Botón "Saltar"</h4>
              <Toggle
                id="show_skip"
                checked={mergedExtra.show_skip_button}
                onChange={(c) => persistExtra({ show_skip_button: c })}
                label="Activar"
              />
            </div>
            {mergedExtra.show_skip_button && (
              <>
                <Field label="Texto">
                  <Input
                    value={mergedExtra.skip_button_text}
                    onChange={(e) => persistExtra({ skip_button_text: e.target.value })}
                    className="w-full border border-table-divider"
                  />
                </Field>
                <Row>
                  <Field label="Pos. X (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(mergedExtra.skip_button_x)}
                      onChange={(e) => persistExtra({ skip_button_x: parseInt(e.target.value, 10) || 92 })}
                      className="w-full border border-table-divider"
                    />
                  </Field>
                  <Field label="Pos. Y (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(mergedExtra.skip_button_y)}
                      onChange={(e) => persistExtra({ skip_button_y: parseInt(e.target.value, 10) || 6 })}
                      className="w-full border border-table-divider"
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Color fondo">
                    <ColorPicker
                      value={mergedExtra.skip_button_color}
                      onChange={(v) => persistExtra({ skip_button_color: v })}
                    />
                  </Field>
                  <Field label="Color texto">
                    <ColorPicker
                      value={mergedExtra.skip_button_text_color}
                      onChange={(v) => persistExtra({ skip_button_text_color: v })}
                    />
                  </Field>
                </Row>
                <Field label="Fuente">
                  <FontSelect
                    value={mergedExtra.skip_button_font_family}
                    onChange={(v) => persistExtra({ skip_button_font_family: v })}
                  />
                </Field>
              </>
            )}
          </div>

          {/* === Custom Buttons === */}
          <div className="border border-table-divider p-4 rounded-lg bg-white space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-table-header-text">
                Botones personalizados ({buttons.length})
              </h4>
              <button
                type="button"
                onClick={addButton}
                className="px-3 py-1.5 text-sm bg-primary-dark text-button-text rounded-md hover:opacity-90"
              >
                + Agregar botón
              </button>
            </div>

            {buttons.length === 0 && (
              <div className="text-xs text-text-muted text-center py-3 border border-dashed border-table-divider rounded">
                Sin botones. Agrega uno con el botón de arriba.
              </div>
            )}

            {buttons.map((btn, idx) => {
              const sel = isSelected({ kind: 'button', id: btn.id });
              return (
                <div
                  key={btn.id}
                  className={`border rounded p-3 space-y-2 bg-white transition-colors ${
                    sel ? 'border-primary-dark' : 'border-table-divider'
                  }`}
                  onClick={() => setSelected({ kind: 'button', id: btn.id })}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-table-header-text">
                      Botón {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeButton(btn.id);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>

                  <Field label="Tipo">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateButton(btn.id, { type: 'text' });
                        }}
                        className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
                          btn.type === 'text'
                            ? 'bg-primary-dark text-button-text border-primary-dark'
                            : 'bg-white border-table-divider text-table-header-text hover:bg-table-row-hover'
                        }`}
                      >
                        Texto
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateButton(btn.id, { type: 'icon' });
                        }}
                        className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
                          btn.type === 'icon'
                            ? 'bg-primary-dark text-button-text border-primary-dark'
                            : 'bg-white border-table-divider text-table-header-text hover:bg-table-row-hover'
                        }`}
                      >
                        Con icono
                      </button>
                    </div>
                  </Field>

                  {btn.type === 'text' ? (
                    <>
                      <Field label="Texto">
                        <Input
                          value={btn.text}
                          onChange={(e) => updateButton(btn.id, { text: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border border-table-divider"
                        />
                      </Field>
                      <Field label="Fuente">
                        <FontSelect
                          value={btn.font_family}
                          onChange={(v) => updateButton(btn.id, { font_family: v })}
                        />
                      </Field>
                      <Row>
                        <Field label="Color fondo">
                          <ColorPicker
                            value={btn.bg_color}
                            onChange={(v) => updateButton(btn.id, { bg_color: v })}
                          />
                        </Field>
                        <Field label="Color texto">
                          <ColorPicker
                            value={btn.text_color}
                            onChange={(v) => updateButton(btn.id, { text_color: v })}
                          />
                        </Field>
                      </Row>
                    </>
                  ) : (
                    <>
                      <Field label="Imagen del icono">
                        <input
                          ref={(el) => {
                            buttonIconRefs.current[btn.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`btn_icon_upload_${btn.id}`}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateButton(btn.id, { icon_url: ev.target?.result as string });
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <label
                            htmlFor={`btn_icon_upload_${btn.id}`}
                            className="px-3 py-1.5 text-sm bg-gray-100 border border-table-divider rounded-md cursor-pointer hover:bg-gray-200"
                          >
                            Subir imagen
                          </label>
                          {btn.icon_url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateButton(btn.id, { icon_url: '' });
                              }}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                      </Field>
                    </>
                  )}

                  <Field label="URL al hacer click">
                    <Input
                      value={btn.url}
                      onChange={(e) => updateButton(btn.id, { url: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="https://..."
                      className="w-full border border-table-divider"
                    />
                  </Field>

                  <Field label="Forma">
                    <select
                      value={btn.shape}
                      onChange={(e) => updateButton(btn.id, { shape: e.target.value as ButtonShape })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-10 border border-table-divider rounded-md bg-white text-sm px-2"
                    >
                      <option value="rounded">Redondeado</option>
                      <option value="pill">Píldora</option>
                      <option value="square">Cuadrado</option>
                    </select>
                  </Field>

                  <Row>
                    <Field label="Ancho (%)">
                      <Input
                        type="number"
                        min={5}
                        max={100}
                        value={Math.round(btn.width)}
                        onChange={(e) => updateButton(btn.id, { width: parseInt(e.target.value, 10) || 20 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full border border-table-divider"
                      />
                    </Field>
                    <Field label="Alto (%)">
                      <Input
                        type="number"
                        min={2}
                        max={50}
                        value={Math.round(btn.height)}
                        onChange={(e) => updateButton(btn.id, { height: parseInt(e.target.value, 10) || 8 })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full border border-table-divider"
                      />
                    </Field>
                  </Row>
                </div>
              );
            })}
          </div>

          {/* === Preview (Canva-style) === */}
          <div className="border border-table-divider p-4 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-table-header-text">
                Preview escritorio (≥768px) — click + arrastra para editar
              </h4>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs px-2 py-1 bg-gray-100 border border-table-divider rounded hover:bg-gray-200"
                >
                  ✕ Deseleccionar
                </button>
              )}
            </div>
            <div className="flex justify-center">
              <div
                className="relative rounded-md overflow-hidden border border-gray-300 shadow-2xl bg-white"
                style={{
                  width: '100%',
                  maxWidth: '720px',
                  aspectRatio: '16 / 10',
                }}
              >
                {/* Browser chrome */}
                <div
                  className="absolute top-0 left-0 right-0 flex items-center px-3 py-2 border-b border-gray-200"
                  style={{ background: '#f3f4f6', height: '32px', zIndex: 60 }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="flex-1 mx-3">
                    <div
                      className="mx-auto rounded-md text-[10px] text-gray-500 flex items-center justify-center"
                      style={{
                        background: '#fff',
                        height: '20px',
                        maxWidth: '280px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      https://kewoz.com
                    </div>
                  </div>
                </div>

                {/* Splash content area */}
                <div
                  ref={previewRef}
                  className="absolute"
                  style={{
                    top: '32px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      mode === 'image' && imageForDesktop
                        ? (() => {
                            const fit =
                              mergedExtra.image_fit === 'contain'
                                ? 'contain'
                                : mergedExtra.image_fit === 'fill'
                                ? '100% 100%'
                                : 'cover';
                            const posY =
                              mergedExtra.image_position_y === 'top'
                                ? 'top'
                                : mergedExtra.image_position_y === 'bottom'
                                ? 'bottom'
                                : 'center';
                            return `url(${imageForDesktop}) center ${posY}/${fit} no-repeat`;
                          })()
                        : mergedExtra.use_gradient
                        ? `linear-gradient(135deg, ${data.splash_bg_color || '#1A0033'}, ${
                            data.splash_bg_color_end || '#3D0066'
                          })`
                        : data.splash_bg_color || '#1A0033',
                    overflow: 'hidden',
                    filter:
                      mode === 'image' && imageForDesktop
                        ? `blur(${mergedExtra.image_blur}px) brightness(${mergedExtra.image_brightness}%) contrast(${mergedExtra.image_contrast}%)`
                        : undefined,
                  }}
                >
                  {/* Image overlay (color layer) */}
                  {mode === 'image' && imageForDesktop && mergedExtra.overlay_enabled && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: mergedExtra.overlay_color,
                        opacity: mergedExtra.overlay_opacity / 100,
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    />
                  )}
                  {/* Gradient overlay */}
                  {mode === 'image' && imageForDesktop && mergedExtra.gradient_overlay_enabled && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          mergedExtra.gradient_overlay_direction === 'to-top'
                            ? `linear-gradient(to top, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                            : mergedExtra.gradient_overlay_direction === 'to-bottom'
                            ? `linear-gradient(to bottom, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                            : mergedExtra.gradient_overlay_direction === 'to-left'
                            ? `linear-gradient(to left, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                            : `linear-gradient(to right, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`,
                        opacity: mergedExtra.gradient_overlay_opacity / 100,
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    />
                  )}
                  {/* Top Bar */}
                  {mergedExtra.top_bar_enabled && mode === 'template' && (
                    <div
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'topbar' },
                          'move',
                          {
                            x: 0,
                            y: 0,
                            w: mergedExtra.top_bar_width,
                            h: mergedExtra.top_bar_height,
                          }
                        )
                      }
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: `${(100 - mergedExtra.top_bar_width) / 2}%`,
                        width: `${mergedExtra.top_bar_width}%`,
                        height: `${mergedExtra.top_bar_height}%`,
                        background: mergedExtra.top_bar_color,
                        color: mergedExtra.top_bar_text_color,
                        fontFamily: `"${mergedExtra.top_bar_font_family}", Inter, sans-serif`,
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {renderHandles(
                        { kind: 'topbar' },
                        {
                          x: 0,
                          y: 0,
                          w: mergedExtra.top_bar_width,
                          h: mergedExtra.top_bar_height,
                        }
                      )}
                      <span style={{ pointerEvents: 'none', padding: '0 8px', textAlign: 'center' }}>
                        {mergedExtra.top_bar_text}
                      </span>
                    </div>
                  )}

                  {/* Icon / Logo */}
                  {mergedExtra.icon_enabled && mergedExtra.icon_url && mode === 'template' && (
                    <div
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'icon' },
                          'move',
                          { x: mergedExtra.icon_x, y: mergedExtra.icon_y, w: mergedExtra.icon_size, h: mergedExtra.icon_size }
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: `${mergedExtra.icon_x}%`,
                        top: `${mergedExtra.icon_y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${mergedExtra.icon_size}px`,
                        height: `${mergedExtra.icon_size}px`,
                        backgroundImage: `url(${mergedExtra.icon_url})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {renderHandles(
                        { kind: 'icon' },
                        { x: mergedExtra.icon_x, y: mergedExtra.icon_y, w: mergedExtra.icon_size, h: mergedExtra.icon_size }
                      )}
                    </div>
                  )}

                  {/* Title — only rendered when non-empty */}
                  {(mode === 'template' || mode === 'image') && mergedExtra.title && (
                    <div
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'title' },
                          'move',
                          { x: mergedExtra.title_x, y: mergedExtra.title_y, w: mergedExtra.title_size, h: mergedExtra.title_size }
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: `${mergedExtra.title_x}%`,
                        top: `${mergedExtra.title_y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: `${mergedExtra.title_size}px`,
                        fontWeight: 700,
                        fontFamily: `"${mergedExtra.title_font_family}", Inter, sans-serif`,
                        textAlign: 'center',
                        width: '90%',
                        cursor: 'pointer',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'none',
                        zIndex: 2,
                      }}
                    >
                      {renderHandles(
                        { kind: 'title' },
                        { x: mergedExtra.title_x, y: mergedExtra.title_y, w: mergedExtra.title_size, h: mergedExtra.title_size }
                      )}
                      <span style={{ pointerEvents: 'none' }}>{mergedExtra.title}</span>
                    </div>
                  )}

                  {/* Subtitle */}
                  {(mode === 'template' || mode === 'image') && mergedExtra.subtitle && (
                    <div
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'subtitle' },
                          'move',
                          { x: mergedExtra.subtitle_x, y: mergedExtra.subtitle_y, w: mergedExtra.subtitle_size, h: mergedExtra.subtitle_size }
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: `${mergedExtra.subtitle_x}%`,
                        top: `${mergedExtra.subtitle_y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: `${mergedExtra.subtitle_size}px`,
                        opacity: 0.9,
                        fontFamily: `"${mergedExtra.subtitle_font_family}", Inter, sans-serif`,
                        textAlign: 'center',
                        width: '85%',
                        cursor: 'pointer',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'none',
                        zIndex: 2,
                      }}
                    >
                      {renderHandles(
                        { kind: 'subtitle' },
                        { x: mergedExtra.subtitle_x, y: mergedExtra.subtitle_y, w: mergedExtra.subtitle_size, h: mergedExtra.subtitle_size }
                      )}
                      <span style={{ pointerEvents: 'none' }}>{mergedExtra.subtitle}</span>
                    </div>
                  )}

                  {/* Dynamic buttons */}
                  {buttons.map((btn) => (
                    <div
                      key={btn.id}
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'button', id: btn.id },
                          'move',
                          { x: btn.x, y: btn.y, w: btn.width, h: btn.height }
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: `${btn.x}%`,
                        top: `${btn.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${btn.width}%`,
                        height: `${btn.height}%`,
                        background: btn.type === 'icon' ? 'transparent' : btn.bg_color,
                        color: btn.text_color,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${Math.max(10, btn.height * 0.5)}px`,
                        fontWeight: 600,
                        fontFamily: `"${btn.font_family}", Inter, sans-serif`,
                        borderRadius:
                          btn.shape === 'pill'
                            ? '999px'
                            : btn.shape === 'rounded'
                            ? '8px'
                            : '0',
                        boxShadow:
                          btn.type === 'icon' ? 'none' : '0 4px 12px rgba(0,0,0,0.25)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        userSelect: 'none',
                      }}
                    >
                      {renderHandles(
                        { kind: 'button', id: btn.id },
                        { x: btn.x, y: btn.y, w: btn.width, h: btn.height }
                      )}
                      {btn.type === 'icon' && btn.icon_url ? (
                        <img
                          src={btn.icon_url}
                          alt=""
                          style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                          }}
                        />
                      ) : (
                        <span style={{ pointerEvents: 'none', padding: '0 8px' }}>{btn.text}</span>
                      )}
                    </div>
                  ))}

                  {/* Skip button */}
                  {mergedExtra.show_skip_button && (
                    <div
                      onMouseDown={(e) =>
                        beginDrag(
                          e,
                          { kind: 'skip' },
                          'move',
                          { x: mergedExtra.skip_button_x, y: mergedExtra.skip_button_y }
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: `${mergedExtra.skip_button_x}%`,
                        top: `${mergedExtra.skip_button_y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: mergedExtra.skip_button_color,
                        color: mergedExtra.skip_button_text_color,
                        padding: '6px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: `"${mergedExtra.skip_button_font_family}", Inter, sans-serif`,
                        borderRadius: '999px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                      }}
                    >
                      {renderHandles(
                        { kind: 'skip' },
                        { x: mergedExtra.skip_button_x, y: mergedExtra.skip_button_y }
                      )}
                      <span style={{ pointerEvents: 'none' }}>{mergedExtra.skip_button_text}</span>
                    </div>
                  )}

                  {/* Countdown badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '999px',
                      pointerEvents: 'none',
                    }}
                  >
                    {duration}s
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-muted text-center mt-2">
              Click en cualquier elemento para seleccionarlo. Arrastra para mover. Cualquier
              esquina (4) redimensiona. Click fuera para deseleccionar.
            </p>

            {/* === Mobile preview === */}
            <div className="mt-6 border-t border-table-divider pt-4">
              <h4 className="text-sm font-bold text-table-header-text mb-3 text-center">
                Preview mobile (&lt;768px) {data.splash_image_mobile ? '— imagen mobile' : '— misma imagen de escritorio'}
              </h4>
              <div className="flex justify-center">
                <div
                  className="relative rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl bg-white"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    aspectRatio: '9 / 16',
                  }}
                >
                  {/* Phone notch */}
                  <div
                    className="absolute top-0 left-0 right-0 flex items-center justify-center"
                    style={{ background: '#1f2937', height: '24px', zIndex: 60 }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="rounded-full" style={{ background: '#000', width: '60px', height: '14px' }} />
                  </div>

                  {/* Mobile splash content area — uses same settings as desktop, only image may differ */}
                  <div
                    ref={previewMobileRef}
                    className="absolute"
                    style={{
                      top: '24px',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        mode === 'image' && imageForMobile
                          ? (() => {
                              const fit = mergedExtra.image_fit === 'contain' ? 'contain' : mergedExtra.image_fit === 'fill' ? '100% 100%' : 'cover';
                              const posY = mergedExtra.image_position_y === 'top' ? 'top' : mergedExtra.image_position_y === 'bottom' ? 'bottom' : 'center';
                              return `url(${imageForMobile}) center ${posY}/${fit} no-repeat`;
                            })()
                          : mergedExtra.use_gradient
                          ? `linear-gradient(135deg, ${data.splash_bg_color || '#1A0033'}, ${data.splash_bg_color_end || '#3D0066'})`
                          : data.splash_bg_color || '#1A0033',
                      overflow: 'hidden',
                      filter:
                        mode === 'image' && imageForMobile
                          ? `blur(${mergedExtra.image_blur}px) brightness(${mergedExtra.image_brightness}%) contrast(${mergedExtra.image_contrast}%)`
                          : undefined,
                    }}
                  >
                    {/* Mobile image overlay */}
                    {mode === 'image' && imageForMobile && mergedExtra.overlay_enabled && (
                      <div style={{ position: 'absolute', inset: 0, background: mergedExtra.overlay_color, opacity: mergedExtra.overlay_opacity / 100, pointerEvents: 'none', zIndex: 1 }} />
                    )}
                    {/* Mobile gradient overlay */}
                    {mode === 'image' && imageForMobile && mergedExtra.gradient_overlay_enabled && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: mergedExtra.gradient_overlay_direction === 'to-top'
                          ? `linear-gradient(to top, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                          : mergedExtra.gradient_overlay_direction === 'to-bottom'
                          ? `linear-gradient(to bottom, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                          : mergedExtra.gradient_overlay_direction === 'to-left'
                          ? `linear-gradient(to left, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`
                          : `linear-gradient(to right, ${mergedExtra.gradient_overlay_color_start}, ${mergedExtra.gradient_overlay_color_end})`,
                        opacity: mergedExtra.gradient_overlay_opacity / 100, pointerEvents: 'none', zIndex: 1
                      }} />
                    )}

                    {/* Mobile Icon */}
                    {mergedExtra.icon_enabled && mergedExtra.icon_url && mode === 'template' && (
                      <div style={{ position: 'absolute', left: `${mergedExtra.icon_x}%`, top: `${mergedExtra.icon_y}%`, transform: 'translate(-50%, -50%)', width: `${mergedExtra.icon_size}px`, height: `${mergedExtra.icon_size}px`, backgroundImage: `url(${mergedExtra.icon_url})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', zIndex: 2 }} />
                    )}

                    {/* Mobile Title */}
                    {(mode === 'template' || mode === 'image') && mergedExtra.title && (
                      <div style={{
                        position: 'absolute', left: `${mergedExtra.title_x}%`, top: `${mergedExtra.title_y}%`,
                        transform: 'translate(-50%, -50%)', color: '#fff', fontSize: `${mergedExtra.title_size}px`,
                        fontWeight: 700, fontFamily: `"${mergedExtra.title_font_family}", Inter, sans-serif`,
                        textAlign: 'center', width: '90%', whiteSpace: 'pre-wrap', zIndex: 2,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {mergedExtra.title}
                      </div>
                    )}

                    {/* Mobile Subtitle */}
                    {(mode === 'template' || mode === 'image') && mergedExtra.subtitle && (
                      <div style={{
                        position: 'absolute', left: `${mergedExtra.subtitle_x}%`, top: `${mergedExtra.subtitle_y}%`,
                        transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.9)', fontSize: `${mergedExtra.subtitle_size}px`,
                        fontWeight: 500, fontFamily: `"${mergedExtra.subtitle_font_family}", Inter, sans-serif`,
                        textAlign: 'center', width: '85%', whiteSpace: 'pre-wrap', zIndex: 2,
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                      }}>
                        {mergedExtra.subtitle}
                      </div>
                    )}

                    {/* Mobile buttons */}
                    {buttons.map((btn) => (
                      <div key={btn.id} style={{
                        position: 'absolute', left: `${btn.x}%`, top: `${btn.y}%`, transform: 'translate(-50%, -50%)',
                        width: `${btn.width}%`, height: `${btn.height}%`, background: btn.type === 'icon' ? 'transparent' : btn.bg_color,
                        color: btn.text_color, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: `${Math.max(8, btn.height * 0.4)}px`, fontWeight: 600,
                        fontFamily: `"${btn.font_family}", Inter, sans-serif`,
                        borderRadius: btn.shape === 'pill' ? '999px' : btn.shape === 'rounded' ? '8px' : '0',
                        boxShadow: btn.type === 'icon' ? 'none' : '0 4px 12px rgba(0,0,0,0.25)', overflow: 'hidden', zIndex: 2
                      }}>
                        {btn.type === 'icon' && btn.icon_url ? (
                          <img src={btn.icon_url} alt="" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ padding: '0 6px' }}>{btn.text}</span>
                        )}
                      </div>
                    ))}

                    {/* Mobile skip button */}
                    {mergedExtra.show_skip_button && (
                      <div style={{
                        position: 'absolute', left: `${typeof mergedExtra.skip_button_x === 'number' ? mergedExtra.skip_button_x : 92}%`,
                        top: `${typeof mergedExtra.skip_button_y === 'number' ? mergedExtra.skip_button_y : 6}%`,
                        transform: 'translate(-50%, -50%)', background: mergedExtra.skip_button_color,
                        color: mergedExtra.skip_button_text_color, padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                        fontFamily: `"${mergedExtra.skip_button_font_family || 'Inter'}", Inter, sans-serif`,
                        borderRadius: '999px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', zIndex: 2
                      }}>
                        {mergedExtra.skip_button_text}
                      </div>
                    )}

                    {/* Mobile countdown */}
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', color: '#fff',
                      padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '999px', pointerEvents: 'none', zIndex: 2
                    }}>
                      {duration}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// === Helpers ===
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs text-text-muted mb-1">{label}</label>
    {children}
  </div>
);

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
);

const FontSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const validFonts = React.useMemo(() => FONT_OPTIONS.map((f) => f.name), []);
  const safeValue = React.useMemo(
    () => (validFonts.includes(value) ? value : 'Inter'),
    [value, validFonts]
  );

  // Preload all fonts so they're ready when applied
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const doc = document as any;
    if (doc.fonts && doc.fonts.load) {
      FONT_OPTIONS.forEach((f) => {
        doc.fonts.load(`16px "${f.name}"`).catch(() => {});
      });
    }
  }, []);

  // Force load the currently selected font
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const doc = document as any;
    if (doc.fonts && doc.fonts.load) {
      doc.fonts.load(`16px "${safeValue}"`).then(() => {
        // Force reflow
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
          void containerRef.current.offsetHeight;
          containerRef.current.style.display = '';
        }
      }).catch(() => {});
    }
  }, [safeValue]);

  const handleSelect = (fontName: string) => {
    onChange(fontName);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="w-full h-10 px-3 border border-table-divider rounded-md bg-white text-sm text-left flex items-center justify-between hover:border-primary-dark transition-colors"
      >
        <span
          style={{
            fontFamily: `"${safeValue}", Inter, sans-serif`,
            fontWeight: 500,
            fontSize: '15px',
            color: '#1f2937',
          }}
        >
          {safeValue}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-table-divider rounded-md shadow-lg max-h-72 overflow-y-auto"
          style={{ minWidth: '220px' }}
        >
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(f.name);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                safeValue === f.name
                  ? 'bg-primary-dark text-button-text'
                  : 'text-table-header-text hover:bg-table-row-hover'
              }`}
            >
              <span
                style={{
                  fontFamily: `"${f.name}", Inter, sans-serif`,
                  fontWeight: 500,
                  fontSize: '15px',
                  display: 'block',
                }}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
