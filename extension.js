                                 import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GDesktopEnums from 'gi://GDesktopEnums';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class ZoomByScrollExtension extends Extension {
    enable() {
        console.log("[Deperto] Enabling extension - Direct Magnifier Mode");

        this._settings = this.getSettings();

        this._wmSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.wm.preferences' });
        this._originalWmModifier = this._wmSettings.get_string('mouse-button-modifier');
        this._wmSettings.set_string('mouse-button-modifier', '<Super>');

        this._updateSettings();
        this._settingsChangedId = this._settings.connect('changed', this._updateSettings.bind(this));

        this._currentZoom = 1.0;
        this._grabConnections = [];

        // Normal operation: capture phase on stage
        this._capturedSignalId = global.stage.connect('captured-event', this._onScrollEvent.bind(this));

        // Grab patch: intercept stage grabs so we receive events during modals/quick-settings
        this._patchGrab();

        // Cursor fix: magnifier doesn't connect cursor-changed when activated programmatically
        this._patchCursor();
    }

    _patchGrab() {
        console.log('[Deperto] _patchGrab: grab is function:', typeof global.stage.grab === 'function');
        if (typeof global.stage.grab !== 'function') {
            console.warn('[Deperto] global.stage.grab not available');
            return;
        }

        const hadOwnProp = Object.prototype.hasOwnProperty.call(global.stage, 'grab');
        const origGrab = global.stage.grab;
        const self = this;

        this._restoreGrab = () => {
            if (hadOwnProp) {
                global.stage.grab = origGrab;
            } else {
                try { delete global.stage.grab; } catch(e) { global.stage.grab = origGrab; }
            }
        };

        try {
            global.stage.grab = function(actor) {
                console.log('[Deperto] patched grab fired, actor:', actor?.get_name?.() ?? 'unnamed');
                const clutterGrab = origGrab.call(global.stage, actor);
                if (actor && !self._grabConnections.find(c => c.actor === actor)) {
                    try {
                        const id = actor.connect('captured-event', self._onScrollEvent.bind(self));
                        const destroyId = actor.connect('destroy', () => {
                            self._grabConnections = self._grabConnections.filter(c => c.actor !== actor);
                        });
                        self._grabConnections.push({ actor, id, destroyId });
                        console.log('[Deperto] connected to grab actor:', actor?.get_name?.() ?? 'unnamed');
                    } catch(e) {
                        console.warn('[Deperto] grab actor connect error:', e.message);
                    }
                }
                return clutterGrab;
            };
            console.log('[Deperto] grab patched, is different fn:', global.stage.grab !== origGrab);
        } catch(e) {
            console.warn('[Deperto] Cannot patch global.stage.grab:', e.message);
            this._restoreGrab = null;
        }
    }

    _patchCursor() {
        try {
            this._cursorTracker = global.display.get_cursor_tracker();
            this._cursorChangedId = this._cursorTracker.connect('cursor-changed', () => {
                if (this._currentZoom <= 1.0 || !Main.magnifier?.isActive()) return;
                for (const region of Main.magnifier.getZoomRegions()) {
                    region._updateMouseSprite?.();
                }
            });
            console.log('[Deperto] cursor tracker connected');
        } catch(e) {
            console.warn('[Deperto] cursor patch error:', e.message);
        }
    }

    _updateSettings() {
        this._modifierKey = this._settings.get_string('modifier-key');
        this._zoomStep = this._settings.get_double('zoom-step');
        this._smoothZoom = this._settings.get_boolean('smooth-zoom');
    }

    disable() {
        console.log("[Deperto] Disabling extension...");

        // Restore grab patch
        if (this._restoreGrab) {
            try { this._restoreGrab(); } catch(e) {}
            this._restoreGrab = null;
        }

        // Clean up grab actor connections
        for (const { actor, id, destroyId } of this._grabConnections) {
            try { actor.disconnect(id); actor.disconnect(destroyId); } catch(e) {}
        }
        this._grabConnections = [];

        // Disconnect cursor tracker
        if (this._cursorChangedId && this._cursorTracker) {
            try { this._cursorTracker.disconnect(this._cursorChangedId); } catch(e) {}
            this._cursorChangedId = null;
            this._cursorTracker = null;
        }

        // Disconnect stage captured-event
        if (this._capturedSignalId) {
            global.stage.disconnect(this._capturedSignalId);
            this._capturedSignalId = null;
        }

        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        if (this._wmSettings) {
            if (this._originalWmModifier)
                this._wmSettings.set_string('mouse-button-modifier', this._originalWmModifier);
            this._wmSettings = null;
        }

        if (this._currentZoom > 1.0)
            this._applyZoom(1.0);

        this._settings = null;
    }

    _onScrollEvent(actor, event) {
        const type = event.type();
        if (type !== Clutter.EventType.SCROLL)
            return Clutter.EVENT_PROPAGATE;

        const state = event.get_state();
        const hasSuper = (state & Clutter.ModifierType.MOD4_MASK) !== 0;
        const hasAlt   = (state & Clutter.ModifierType.MOD1_MASK) !== 0;
        const hasCtrl  = (state & Clutter.ModifierType.CONTROL_MASK) !== 0;

        if (!hasSuper || hasAlt || hasCtrl)
            return Clutter.EVENT_PROPAGATE;

        const direction = event.get_scroll_direction();
        let zoomChange = 0;
        const ZOOM_STEP = this._zoomStep || 0.25;

        if (direction === Clutter.ScrollDirection.SMOOTH) {
            const [, dy] = event.get_scroll_delta();
            zoomChange = -dy * ZOOM_STEP;
        } else if (direction === Clutter.ScrollDirection.UP) {
            zoomChange = ZOOM_STEP;
        } else if (direction === Clutter.ScrollDirection.DOWN) {
            zoomChange = -ZOOM_STEP;
        }

        if (Math.abs(zoomChange) < 0.001) return Clutter.EVENT_STOP;

        let newZoom = Math.max(1.0, Math.min(20.0, this._currentZoom + zoomChange));
        if (newZoom !== this._currentZoom)
            this._applyZoom(newZoom);

        return Clutter.EVENT_STOP;
    }

    _applyZoom(zoomFactor) {
        this._currentZoom = zoomFactor;

        if (!Main.magnifier) {
            console.error("[Deperto] Main.magnifier not found");
            return;
        }

        if (this._currentZoom > 1.0) {
            if (!Main.magnifier.isActive())
                Main.magnifier.setActive(true);
        } else {
            if (Main.magnifier.isActive())
                Main.magnifier.setActive(false);
        }

        let regions = Main.magnifier.getZoomRegions();
        if (regions.length === 0 && this._currentZoom > 1.0) {
            const [width, height] = global.display.get_size();
            const roi = { x: 0, y: 0, width, height };
            const viewPort = { x: 0, y: 0, width, height };
            const newRegion = Main.magnifier.createZoomRegion(zoomFactor, zoomFactor, roi, viewPort);
            Main.magnifier.addZoomRegion(newRegion);
            regions = [newRegion];
        }

        regions.forEach(region => {
            region._changeROI({
                xMagFactor: zoomFactor,
                yMagFactor: zoomFactor,
                redoCursorTracking: true,
                animate: this._smoothZoom,
            });

            if (region.getMouseTrackingMode() !== GDesktopEnums.MagnifierMouseTrackingMode.PROPORTIONAL)
                region.setMouseTrackingMode(GDesktopEnums.MagnifierMouseTrackingMode.PROPORTIONAL);

            // Refresh cursor sprite immediately after zoom change
            region._updateMouseSprite?.();
        });
    }
}
