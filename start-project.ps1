Set-Location 'c:\Users\nandh\OneDrive\Desktop\faculty teaching analyzer'
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-Command','Set-Location ''c:\Users\nandh\OneDrive\Desktop\faculty teaching analyzer\\backend''; npm start'
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-Command','Set-Location ''c:\Users\nandh\OneDrive\Desktop\faculty teaching analyzer\\frontend''; npm start'
