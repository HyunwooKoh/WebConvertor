import os
import zipfile
import tarfile
import shutil

def set_permissions(tarinfo):
    tarinfo.mode = 0o777 
    return tarinfo

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.realpath(__file__)))

    os.system("nvm use 18.13.0")

    if os.system("npm --version") != 0:
        print("npm is not available! should be install npm.")
        exit(0)

    os.system("npm install")

    os.chdir('./test/program')
    os.system("pyinstaller -w -F webconvertor-tool.py")
    os.chdir('../../')
    
    os.system("npm run build:windows")
    shutil.copy('./test/program/dist/webconvertor-tool.exe', './dist/webConvertor-win32-ia32/webconvertor-tool.exe')
    with zipfile.ZipFile('dist/webConvertor-win32-ia32.zip', 'w') as zip: 
        for folder, subfolders, files in os.walk('dist/webConvertor-win32-ia32'):
            for file in files:
                zip.write(os.path.join(folder, file), os.path.relpath(os.path.join(folder,file), 'dist/webConvertor-win32-ia32'), compress_type = zipfile.ZIP_DEFLATED)

    os.system("npm run build:linux")
    with tarfile.open(f'dist/webConvertor-linux-x64.tar.gz', "w:gz") as tar:
        os.chdir('dist/webConvertor-linux-x64')
        for file in os.listdir():
            tar.add(file, filter=set_permissions)
        os.chdir('../..')