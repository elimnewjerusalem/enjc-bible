// ── ENJC Verse Studio — Main Entry Point ─────────────────────────
// Import order matters: data → canvas → export → ui
// Each file registers its own window.* globals on import

import './imagegen-data.js';
import './imagegen-canvas.js';
import { goBack } from './imagegen-export.js';
import {
  initStudio, toggleStudioTheme, debounceDraw,
  switchTab, applyTemplate,
  setFont, setTC, setColorHex,
  mobOpen, mobClose, syncMobile,
  setSz, setBG, togOpt,
  prevVerse, nextVerse, useVOTD, shuffleVerse,
  useCustomVerse, mUseCustomVerse, selVerse,
  setVerseTag, updateBadges, updateVerseDisplay,
  onTS, onTE,
  biRenderBooks, biSearch, biFilter,
  biSelectBook, biBackBooks, biSelectCh, biBackCh, biUseVerse,
  mbiRenderBooks, mbiSearch, mbiFilter,
  mbiSelectBook, mbiBackBooks, mbiSelectCh, mbiBackCh, mbiUseVerse,
  pickPhoto, loadGal, setGalGroup,
  buildGradPresets, setGradPreset, updateGradPreview,
  onHexInput, onRGB, onGradColor, onGradAngle,
  setPhotoOverlay, snapshotST, undoLast,
  syncMobileStyle, syncMobileText, syncMobileBG,
  saveDesign, addToGallery, loadGalCustom, removeMyPhoto,
} from './imagegen-ui.js';

// Expose UI functions to window so HTML onclick= attributes work
Object.assign(window, {
  toggleStudioTheme, debounceDraw,
  switchTab, applyTemplate,
  setFont, setTC, setColorHex,
  mobOpen, mobClose, syncMobile,
  setSz, setBG, togOpt,
  prevVerse, nextVerse, useVOTD, shuffleVerse,
  useCustomVerse, mUseCustomVerse, selVerse,
  setVerseTag, updateBadges, updateVerseDisplay,
  onTS, onTE,
  biRenderBooks, biSearch, biFilter,
  biSelectBook, biBackBooks, biSelectCh, biBackCh, biUseVerse,
  mbiRenderBooks, mbiSearch, mbiFilter,
  mbiSelectBook, mbiBackBooks, mbiSelectCh, mbiBackCh, mbiUseVerse,
  pickPhoto, loadGal, setGalGroup,
  setGradPreset, updateGradPreview,
  onHexInput, onRGB, onGradColor, onGradAngle,
  setPhotoOverlay, snapshotST, undoLast,
  syncMobileStyle, syncMobileText, syncMobileBG,
  saveDesign, goBack, addToGallery, loadGalCustom, removeMyPhoto,
});

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', initStudio);
