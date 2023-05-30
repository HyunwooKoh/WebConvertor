import os
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QFileDialog, QListWidget, QCheckBox, QListWidgetItem

class FileBrowser(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle('파일 브라우저')

        # 디렉토리 선택 버튼
        select_dir_button = QPushButton('디렉토리 선택')
        select_dir_button.clicked.connect(self.select_directory)

        # 파일 리스트 위젯
        self.file_list_widget = QListWidget()

        # 전체 레이아웃
        main_layout = QVBoxLayout()
        main_layout.addWidget(select_dir_button)
        main_layout.addWidget(self.file_list_widget)
        self.setLayout(main_layout)

    def select_directory(self):
        directory = QFileDialog.getExistingDirectory(self, '디렉토리 선택')
        if directory:
            self.file_list_widget.clear()
            for file_name in os.listdir(directory):
                item = QListWidgetItem()
                self.file_list_widget.addItem(item)

                checkbox = QCheckBox(file_name)
                checkbox.setObjectName(file_name)
                self.file_list_widget.setItemWidget(item, checkbox)

if __name__ == '__main__':
    app = QApplication([])
    window = FileBrowser()
    window.show()
    app.exec_()