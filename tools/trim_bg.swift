// Cut the subject out of a photo using Apple's Vision foreground mask.
// Usage: swift trim_bg.swift <input> <output.png>
import Foundation
import AppKit
import Vision
import CoreImage

guard CommandLine.arguments.count >= 3 else {
    FileHandle.standardError.write("usage: trim_bg <in> <out.png>\n".data(using: .utf8)!)
    exit(2)
}
let inPath = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]

guard let nsimg = NSImage(contentsOfFile: inPath),
      let cg = nsimg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("cannot load \(inPath)\n".data(using: .utf8)!)
    exit(1)
}

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([req]) } catch {
    FileHandle.standardError.write("vision failed: \(error)\n".data(using: .utf8)!)
    exit(1)
}
guard let res = req.results?.first else {
    FileHandle.standardError.write("no foreground subject found in \(inPath)\n".data(using: .utf8)!)
    exit(3)
}
do {
    let pb = try res.generateMaskedImage(ofInstances: res.allInstances, from: handler, croppedToInstancesExtent: true)
    let ci = CIImage(cvPixelBuffer: pb)
    let ctx = CIContext()
    guard let outCG = ctx.createCGImage(ci, from: ci.extent) else { exit(1) }
    let rep = NSBitmapImageRep(cgImage: outCG)
    guard let data = rep.representation(using: .png, properties: [:]) else { exit(1) }
    try data.write(to: URL(fileURLWithPath: outPath))
    print("wrote \(outPath) \(outCG.width)x\(outCG.height)")
} catch {
    FileHandle.standardError.write("mask gen failed: \(error)\n".data(using: .utf8)!)
    exit(1)
}
