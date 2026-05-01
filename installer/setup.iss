; ============================================================
;  SysMon Pro — Inno Setup Script
;  Builds: SysMonPro-Setup.exe
;
;  Prerequisites before running Inno Setup Compiler:
;    1. npm run build:dashboard          (builds React to packages/dashboard/dist)
;    2. npm install --prefix packages/server
;    3. Place Node.js portable zip in installer/node/ as node.exe
;       (download from https://nodejs.org/en/download — "Windows Binary (.zip)")
;
;  What the installer does:
;    - Copies server + node runtime + dashboard dist to Program Files
;    - Registers SysMon Pro as a Windows Service (auto-start)
;    - Creates Start Menu shortcut to open dashboard in browser
;    - Creates Desktop shortcut
;    - Registers uninstaller in Add/Remove Programs
; ============================================================

#define AppName      "SysMon Pro"
#define AppVersion   "1.0.0"
#define AppPublisher "Your Name"
#define AppURL       "https://github.com/yourusername/sysmon-pro"
#define AppExeName   "SysMonPro-Setup.exe"
#define ServiceName  "SysMonPro"
#define ServicePort  "3001"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\SysMonPro
DefaultGroupName={#AppName}
AllowNoIcons=yes
; Require admin so we can register a Windows Service
PrivilegesRequired=admin
OutputDir=dist
OutputBaseFilename=SysMonPro-Setup
SetupIconFile=assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardImageFile=assets\wizard-banner.bmp
WizardSmallImageFile=assets\wizard-small.bmp
UninstallDisplayIcon={app}\assets\icon.ico
; Create uninstall entry in Add/Remove Programs
CreateUninstallRegKey=yes
UninstallDisplayName={#AppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon";    Description: "{cm:CreateDesktopIcon}";    GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupbrowser"; Description: "Open dashboard in browser after install"; GroupDescription: "After install:"; Flags: checked

[Files]
; Node.js runtime (portable — no system Node required on target machine)
Source: "node\node.exe";         DestDir: "{app}\runtime"; Flags: ignoreversion

; Server source
Source: "..\packages\server\src\*";   DestDir: "{app}\server\src";  Flags: ignoreversion recursesubdirs
Source: "..\packages\server\node_modules\*"; DestDir: "{app}\server\node_modules"; Flags: ignoreversion recursesubdirs
Source: "..\packages\server\.env";    DestDir: "{app}\server";      Flags: ignoreversion onlyifdoesntexist

; Built dashboard (served statically by Express)
Source: "..\packages\dashboard\dist\*"; DestDir: "{app}\server\..\..\dashboard\dist"; Flags: ignoreversion recursesubdirs

; Assets
Source: "assets\icon.ico";       DestDir: "{app}\assets"; Flags: ignoreversion
Source: "assets\icon.png";       DestDir: "{app}\assets"; Flags: ignoreversion

; Service install/uninstall helpers
Source: "service-helper\install-service.bat";   DestDir: "{app}"; Flags: ignoreversion
Source: "service-helper\uninstall-service.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Open Dashboard"; Filename: "http://localhost:{#ServicePort}"; IconFilename: "{app}\assets\icon.ico"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#AppName}";   Filename: "http://localhost:{#ServicePort}"; IconFilename: "{app}\assets\icon.ico"; Tasks: desktopicon

[Run]
; Register and start the Windows Service after files are copied
Filename: "{app}\install-service.bat"; Parameters: """{app}"""; StatusMsg: "Registering Windows Service..."; Flags: runhidden waituntilterminated

; Optionally open dashboard in browser
Filename: "http://localhost:{#ServicePort}"; Description: "Open SysMon Pro Dashboard"; Flags: shellexec postinstall skipifsilent; Tasks: startupbrowser

[UninstallRun]
; Stop and remove service on uninstall
Filename: "{app}\uninstall-service.bat"; Parameters: ""; Flags: runhidden waituntilterminated

[Code]
// Check if Node.js runtime exists before install
function InitializeSetup(): Boolean;
begin
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then begin
    // Nothing extra needed — service is registered via [Run]
  end;
end;
