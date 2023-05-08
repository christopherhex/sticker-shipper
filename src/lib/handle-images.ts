import { writeFile, mkdir, readdir, readFile} from "fs/promises"
import { exec } from "child_process"
import sharp from "sharp"
import * as path from 'path'

const FILE_DIR_INBOX = `./filestorage/inbox`
const FILE_DIR_QUEUE = `./filestorage/queue`
const FILE_DIR_OUTBOX = `./filestorage/outbox`

const DPI = 300;

let initDone = false;

async function assureDirectoriesExist() {

    if(!initDone){
        await mkdir(path.join(process.cwd(), FILE_DIR_INBOX), {recursive: true});
        await mkdir(path.join(process.cwd(), FILE_DIR_QUEUE), {recursive: true});
        await mkdir(path.join(process.cwd(), FILE_DIR_OUTBOX), {recursive: true});
    }
}


export async function saveInbox(file: File){
    await assureDirectoriesExist();

    const strippedFileName = file.name.substring(0, file.name.length-4);
    const pdfFilePath = path.join(process.cwd(), FILE_DIR_INBOX, strippedFileName + '.pdf');
    const pngFilePath = path.join(process.cwd(), FILE_DIR_INBOX, strippedFileName + '.png');
    const pngOutputPath = path.join(process.cwd(), FILE_DIR_QUEUE, strippedFileName + '.png');

    const fileBuf = await file.arrayBuffer();
    // Save PDF
    await writeFile(pdfFilePath, new Uint8Array(fileBuf),{flag:'w'});
    //Create filename substring (remove .pdf)
    exec(`convert --density 300 --quality 100 ${pdfFilePath} ${pngFilePath}`, () => {

        const image = sharp(pngFilePath);

        image
            .metadata()
            .then(metadata => {
                return image
                    .extract({
                        left: 0, 
                        top: 0,
                        width: metadata.width || 0,
                        height: Math.round((metadata.height || 0)/2) || 0
                    })
                    .toFile(pngOutputPath)
            })
    })


    
}

export async function generateLabels(){

    const A4_WIDTH = Math.round(8.27 * DPI);
    const A4_HEIGHT = Math.round(11.69 * DPI);

    let newImageDataBuffer = await sharp({
        create: {
            width: A4_WIDTH,
            height: A4_HEIGHT,
            channels: 4,
            background: "#ffffff"
        }
    }).toFormat('png').toBuffer();

    const files = await readdir(path.join(process.cwd(), FILE_DIR_QUEUE));

    for (let i = 0; i  < files.length ; i++){

        const filePath = path.join(process.cwd(), FILE_DIR_QUEUE,files[i]);

        const xOffset = (i%2) * Math.round(A4_WIDTH/2);
        const yOffset = i > 1 ? Math.round(A4_HEIGHT/2) : 0 ;

        console.log(files[i]);

        const overlayData = await sharp(filePath)
            .rotate(90)
            .resize({width: Math.round(A4_WIDTH/2) , height: Math.round(A4_HEIGHT/2)})
            .toBuffer();

        newImageDataBuffer = await sharp(newImageDataBuffer)
            .composite([
                { input: overlayData, blend: 'over', top: yOffset, left: xOffset }
            ]).toBuffer();

    }

    const pngFilePath = path.join(process.cwd(), FILE_DIR_OUTBOX, 'test.png');
    const pdfFilePath = path.join(process.cwd(), FILE_DIR_OUTBOX, 'test.pdf')

    await sharp(newImageDataBuffer).toFormat('png').toFile(path.join(process.cwd(), FILE_DIR_OUTBOX, 'test.png'))

    exec(`convert --density 300 --quality 100 ${pngFilePath} ${pdfFilePath} `, () => {});

    // ReadFile
    const pdfBuffer = await readFile(pdfFilePath);

    return pdfBuffer

}