import multer from "multer"

const storage = multer.memoryStorage();

const uplodes= multer({
    storage,limits:{fieldSize:5*1024*1024}
})
export default uplodes;