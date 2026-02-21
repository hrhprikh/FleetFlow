import 'dart:io';

import 'package:image_picker/image_picker.dart';

class MediaPickerService {
  MediaPickerService(this._picker);

  final ImagePicker _picker;

  Future<File?> pickImage() async {
    final file = await _picker.pickImage(source: ImageSource.camera);
    return file == null ? null : File(file.path);
  }

  Future<File?> pickImageFromGallery() async {
    final file = await _picker.pickImage(source: ImageSource.gallery);
    return file == null ? null : File(file.path);
  }

  Future<File?> pickVideo() async {
    final file = await _picker.pickVideo(source: ImageSource.camera);
    return file == null ? null : File(file.path);
  }
}
