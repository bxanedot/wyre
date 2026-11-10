/*
 * Wyre's interface icons are SF Symbols from GlyphStudio. glyphs.ts is generated from glyph-names.json by
 * scripts/sync-glyphs.mjs; each export keeps the icon name the interface used before, so call sites only
 * change their import. Brand marks for third-party applications stay in md-icon.vue.
 */
import { defineComponent, h } from 'vue';

import { glyphs } from '@/components/icons/glyphs';

export type GlyphName = keyof typeof glyphs;

export function glyph(name: GlyphName) {
  return defineComponent({
    name: `Sf${name}`,
    props: {
      size: { type: [Number, String], default: 24 },
      // Accepted for compatibility with stroked icon sets; SF Symbols are filled shapes.
      strokeWidth: { type: [Number, String], default: undefined },
    },
    setup(props) {
      const [width, height, ...paths] = glyphs[name];
      // SF Symbols fill their viewport edge to edge; pad the box so they sit like the previous 24px line icons.
      const box = Math.max(width, height) * 1.2;
      const viewBox = `${(width - box) / 2} ${(height - box) / 2} ${box} ${box}`;
      return () =>
        h(
          'svg',
          {
            width: props.size,
            height: props.size,
            viewBox,
            fill: 'currentColor',
            'aria-hidden': 'true',
            focusable: 'false',
          },
          paths.map(d => h('path', { d }))
        );
    },
  });
}

export const AppWindow = glyph('AppWindow');
export const AppWindowMac = glyph('AppWindowMac');
export const ArrowDown = glyph('ArrowDown');
export const ArrowUp = glyph('ArrowUp');
export const ArrowUpDown = glyph('ArrowUpDown');
export const BrainCircuit = glyph('BrainCircuit');
export const BrushCleaning = glyph('BrushCleaning');
export const Bug = glyph('Bug');
export const ChartPie = glyph('ChartPie');
export const Check = glyph('Check');
export const ChevronDown = glyph('ChevronDown');
export const ChevronLeft = glyph('ChevronLeft');
export const ChevronRight = glyph('ChevronRight');
export const ChevronUp = glyph('ChevronUp');
export const CircleCheckIcon = glyph('CircleCheckIcon');
export const CircleQuestionMark = glyph('CircleQuestionMark');
export const CircleUserRound = glyph('CircleUserRound');
export const Clipboard = glyph('Clipboard');
export const ClipboardClock = glyph('ClipboardClock');
export const Clock = glyph('Clock');
export const CodeXml = glyph('CodeXml');
export const Compass = glyph('Compass');
export const Copy = glyph('Copy');
export const Cpu = glyph('Cpu');
export const Database = glyph('Database');
export const Disc3 = glyph('Disc3');
export const Download = glyph('Download');
export const ExternalLink = glyph('ExternalLink');
export const Eye = glyph('Eye');
export const EyeOff = glyph('EyeOff');
export const File = glyph('File');
export const FileArchive = glyph('FileArchive');
export const FileAudio = glyph('FileAudio');
export const FileClock = glyph('FileClock');
export const FileCode2 = glyph('FileCode2');
export const FileCog = glyph('FileCog');
export const FileImage = glyph('FileImage');
export const FileSearch = glyph('FileSearch');
export const FileSpreadsheet = glyph('FileSpreadsheet');
export const FileText = glyph('FileText');
export const FileVideo = glyph('FileVideo');
export const Folder = glyph('Folder');
export const FolderClock = glyph('FolderClock');
export const FolderOpen = glyph('FolderOpen');
export const FolderPlus = glyph('FolderPlus');
export const FolderSearch = glyph('FolderSearch');
export const FolderX = glyph('FolderX');
export const FunnelX = glyph('FunnelX');
export const Gamepad2 = glyph('Gamepad2');
export const Globe2 = glyph('Globe2');
export const GripVertical = glyph('GripVertical');
export const HardDrive = glyph('HardDrive');
export const History = glyph('History');
export const House = glyph('House');
export const Info = glyph('Info');
export const InfoIcon = glyph('InfoIcon');
export const Languages = glyph('Languages');
export const LayoutGrid = glyph('LayoutGrid');
export const List = glyph('List');
export const ListStart = glyph('ListStart');
export const Loader2Icon = glyph('Loader2Icon');
export const LockKeyhole = glyph('LockKeyhole');
export const Mail = glyph('Mail');
export const MapPin = glyph('MapPin');
export const MemoryStick = glyph('MemoryStick');
export const Minus = glyph('Minus');
export const Monitor = glyph('Monitor');
export const Network = glyph('Network');
export const OctagonXIcon = glyph('OctagonXIcon');
export const Package = glyph('Package');
export const PackageMinus = glyph('PackageMinus');
export const PackageX = glyph('PackageX');
export const Palette = glyph('Palette');
export const PanelLeftClose = glyph('PanelLeftClose');
export const PanelLeftOpen = glyph('PanelLeftOpen');
export const Paperclip = glyph('Paperclip');
export const Plus = glyph('Plus');
export const Power = glyph('Power');
export const Presentation = glyph('Presentation');
export const Printer = glyph('Printer');
export const RefreshCw = glyph('RefreshCw');
export const Rocket = glyph('Rocket');
export const ScanSearch = glyph('ScanSearch');
export const Search = glyph('Search');
export const Settings = glyph('Settings');
export const ShieldCheck = glyph('ShieldCheck');
export const Sparkles = glyph('Sparkles');
export const Square = glyph('Square');
export const SunMoon = glyph('SunMoon');
export const TextCursorInput = glyph('TextCursorInput');
export const ThumbsDown = glyph('ThumbsDown');
export const ThumbsUp = glyph('ThumbsUp');
export const Trash2 = glyph('Trash2');
export const TriangleAlertIcon = glyph('TriangleAlertIcon');
export const Video = glyph('Video');
export const Wallpaper = glyph('Wallpaper');
export const Wrench = glyph('Wrench');
export const X = glyph('X');
export const XIcon = glyph('XIcon');
export const Zap = glyph('Zap');
