import os
import sys
import subprocess
import time
import shutil
from configparser import ConfigParser
from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QCheckBox, QFileDialog, QLabel, QWidget, QPushButton, QMessageBox, QProgressDialog


class FileSelectorWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('webConvertor-tool')
        self.setGeometry(200, 200, 400, 200)

        self.central_widget = QWidget(self)
        self.setCentralWidget(self.central_widget)

        self.layout = QVBoxLayout()
        self.central_widget.setLayout(self.layout)

        self.directory_label = QLabel()
        self.layout.addWidget(self.directory_label)

        self.checkboxes = []
        self.selected_files = []

        self.open_directory_dialog()
        self.checkedAll = False
        self.directoryPath : str

    def open_directory_dialog(self):
        options = QFileDialog.Options()
        directory = QFileDialog.getExistingDirectory(self, "webConvertor-tool", options=options)
        if directory:
            self.directory_label.setText(f"Selected Directory: {directory}")
            self.directoryPath = str(directory)
            self.load_files_in_directory(directory)

    def load_files_in_directory(self, directory):
        self.clear_checkboxes()
        files = os.listdir(directory)
        for file_name in files:
            if file_name.endswith(('.html','.xml','htm')):
                checkbox = QCheckBox(file_name)
                checkbox.setChecked(False)
                checkbox.stateChanged.connect(self.handle_checkbox_change)
                self.checkboxes.append(checkbox)
                self.layout.addWidget(checkbox)

        select_all_button = QPushButton("Select all")
        select_all_button.clicked.connect(self.select_all_checkboxes)
        self.layout.addWidget(select_all_button)

        convert_selected_files_button = QPushButton("Convert Selected Files")
        convert_selected_files_button.clicked.connect(self.convert_selected_files)
        self.layout.addWidget(convert_selected_files_button)

    def clear_checkboxes(self):
        for checkbox in self.checkboxes:
            checkbox.setParent(None)
        self.checkboxes.clear()

    def handle_checkbox_change(self, state):
        checkbox = self.sender()
        file_name = checkbox.text()
        self.checkedAll = False

        if state == Qt.Checked:
            self.selected_files.append(file_name)
        else:
            self.selected_files.remove(file_name)

    def select_all_checkboxes(self):
        if self.checkedAll:
            for checkbox in self.checkboxes:
                checkbox.setChecked(False)
        else:
            for checkbox in self.checkboxes:
                checkbox.setChecked(True)
                self.checkedAll = True

    def convert_selected_files(self):
        config = ConfigParser()
        config.read('webConvertor.ini')
        options = []
        for i in config['option_Use']:
            print(i)

        modulePath = config['module']['path'] + '\webconvertor.exe'
        progress_dialog = QProgressDialog("Processing...", None, 0, 100, self)
        progress_dialog.setWindowTitle("Selected Files")
        progress_dialog.setAutoClose(True)
        progress_dialog.setAutoReset(True)
        
        if os.path.exists(self.directoryPath + '/convertion'):
            shutil.rmtree(self.directoryPath + '/convertion')
        os.mkdir(self.directoryPath + '/convertion/')
        for i in range(len(self.selected_files)):
            progress_dialog.setValue(i // len(self.selected_files))
            cmd = [modulePath,'--input=' + self.directoryPath + '/' + self.selected_files[i],'--output=' + self.directoryPath + '/convertion/' + self.selected_files[i] + '.pdf'] + options
            subprocess.run(cmd)
            
        #QMessageBox.information(self, "webConvertor-tool", inform)
        exit(0)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = FileSelectorWindow()
    window.show()
    sys.exit(app.exec_())
