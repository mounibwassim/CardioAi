import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, RotateCcw } from 'lucide-react';

interface SignatureCanvasComponentProps {
    onSave: (signature: string) => void;
    onClose: () => void;
}

export interface SignatureCanvasRef {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: () => string;
}

const SignatureCanvasComponent = forwardRef<SignatureCanvasRef, SignatureCanvasComponentProps>(
    ({ onSave, onClose, initialSignature }, ref) => {
        const sigCanvas = useRef<SignatureCanvas>(null);

        useImperativeHandle(ref, () => ({
            clear: () => sigCanvas.current?.clear(),
            isEmpty: () => sigCanvas.current?.isEmpty() ?? true,
            toDataURL: () => sigCanvas.current?.toDataURL() ?? '',
        }));

        const handleClear = () => {
            sigCanvas.current?.clear();
        };

        const handleSave = () => {
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                const signatureData = sigCanvas.current.toDataURL();
                onSave(signatureData);
            } else {
                alert('Please provide a signature before saving.');
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Digital Signature</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">
                            Please sign in the box below using your mouse or touchscreen.
                        </p>
                        <div className="border-2 border-slate-300 rounded-lg bg-white">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{
                                    className: 'w-full h-48 cursor-crosshair',
                                }}
                                backgroundColor="white"
                                penColor="black"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleClear}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Clear
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                            >
                                Save Signature
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

SignatureCanvasComponent.displayName = 'SignatureCanvasComponent';

export default SignatureCanvasComponent;
