import multer from 'multer';
const fileSize = 1024 * 1024 * 5; // 5MB

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload a valid image file'))
    }
    cb(undefined, true)
}
const upload = multer({ storage, fileFilter, limits: { fileSize: fileSize } })

export default upload;