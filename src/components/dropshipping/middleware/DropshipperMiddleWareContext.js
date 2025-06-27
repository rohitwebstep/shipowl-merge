import { createContext, useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const DropshipperMiddleWareContext = createContext();

export const useDropshipper = () => {
    const context = useContext(DropshipperMiddleWareContext);
    if (!context) {
        throw new Error("useAdmin must be used within an DropshipperMiddleWareProvider");
    }
    return context;
};

export default function DropshipperMiddleWareProvider({ children }) {
    const [dropShipperApi, setDropShipperApi] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    function InputField({ label, value, onChange, error, required }) {
        return (
            <>
                <div className='flex justify-between'>
                    <label className="md:w-7/12 block text-sm font-medium mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </label>

                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`md:w-5/12 bg-white border px-3 py-[6px] ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </>
        );
    }

    // Result output component with conditional display
    function ResultItem({ label, value, isVisible, placeholder = '-' }) {
        const numeric = parseFloat(value?.replace?.(/[₹,]/g, '')) || 0;
        return (
            <div className="flex justify-between text-sm w-full">
                <span className="font-medium text-black">{label}</span>
                <span className={` font-bold  text-green-800 ${!isVisible ? 'text-gray-400' : numeric < 0 ? 'text-red-800' : 'text-green-800'}`}>
                    {isVisible ? value : placeholder}
                </span>
            </div>
        );
    }

    // Info box component
    function ProductInfo({ label, value }) {
        return (
            <div className="flex items-center space-x-1 text-sm">
                <span className="text-gray-500">{label}:</span>
                <span className="font-medium text-black">{value}</span>
            </div>
        );
    }
    const verifyDropShipperAuth = useCallback(async () => {
        setLoading(true);
        const supplierData = JSON.parse(localStorage.getItem("shippingData"));
        const dropshipper_token = supplierData?.security?.token;

        // ✅ Corrected the condition for active panel
        if (supplierData?.project?.active_panel !== "dropshipper") {
            localStorage.removeItem("shippingData"); // Correct way to remove item
            router.push("/dropshipping/auth/login");
            return; // Stop further execution
        }

        if (!dropshipper_token) {
            router.push("/dropshipping/auth/login");
            return; // Stop further execution
        }

        try {
            const response = await fetch(`/api/dropshipper/auth/verify`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${dropshipper_token}`,
                },
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                Swal.fire({
                    icon: "error",
                    title: "Something Wrong!",
                    text: errorMessage.error || errorMessage.message || "Your session has expired. Please log in again.",
                });
                throw new Error(errorMessage.message || errorMessage.error || "Something Wrong!");
            }

            const result = await response.json();

            if (result.message !== "Token is valid") {
                Swal.fire({
                    icon: "error",
                    title: "Unauthorized",
                    text: "Invalid token or unauthorized access.",
                });
                router.push("/dropshipping/auth/login");
                return;
            }


        } catch (error) {
            console.error("Error:", error);
            setError(error.message || "Something went wrong");
            router.push("/dropshipping/auth/login");
        } finally {
            setLoading(false);
        }
    }, [router, setLoading]);


    return (
        <DropshipperMiddleWareContext.Provider value={{InputField,ResultItem,ProductInfo, dropShipperApi, setDropShipperApi, verifyDropShipperAuth, error, loading }}>
            {children}
        </DropshipperMiddleWareContext.Provider>
    );
}
