#Requires AutoHotkey v2.0

; ============================================================
; Zoom by Scroll — Windows
; Hold Win key + scroll wheel to zoom in/out
; Uses Windows built-in Magnifier (magnify.exe)
; ============================================================

; Win + Scroll Up → zoom in
#WheelUp:: {
    if !WinExist("ahk_exe magnify.exe")
        Run "magnify.exe"
    Sleep 200  ; wait for Magnifier to open on first use
    Send "#{=}"
}

; Win + Scroll Down → zoom out
#WheelDown:: {
    if WinExist("ahk_exe magnify.exe")
        Send "#{-}"
}

; Win + Scroll Click (middle button) → close Magnifier / reset zoom
#MButton:: {
    if WinExist("ahk_exe magnify.exe")
        Send "#Escape"
}
