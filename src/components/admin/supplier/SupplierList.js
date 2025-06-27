"use client";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { useRouter } from "next/navigation";
import HashLoader from "react-spinners/HashLoader";
import React, { useState, useEffect, useContext } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { MdModeEdit, MdRestoreFromTrash } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { useAdmin } from '../middleware/AdminMiddleWareContext';
import { useAdminActions } from '@/components/commonfunctions/MainContext';
import { ProfileContext } from './ProfileContext';
import Swal from 'sweetalert2';
const SupplierList = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [isTrashed, setIsTrashed] = useState(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const [password, setPassword] = useState('');
    const [expandPassModal, setExpandPassModal] = useState(null);
    const [selected, setSelected] = useState([]);
    const { setActiveSubTab } = useContext(ProfileContext);

    const handleCheckboxChange = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };
    const { fetchAll, fetchTrashed, softDelete, restore, destroy } = useAdminActions("admin/supplier", "suppliers");


    const handleToggleTrash = async () => {
        setIsTrashed(prev => !prev);
        if (!isTrashed) {
            await fetchTrashed(setSuppliers, setLoading);
        } else {
            await fetchAll(setSuppliers, setLoading);
        }
    };

    const handleSoftDelete = (id) => softDelete(id, () => fetchAll(setSuppliers, setLoading));
    const handleRestore = (id) => restore(id, () => fetchTrashed(setSuppliers, setLoading));
    const handleDestroy = (id) => destroy(id, () => fetchTrashed(setSuppliers, setLoading));
    const { verifyAdminAuth, isAdminStaff, checkAdminRole, extractedPermissions } = useAdmin();
    const shouldCheckPermissions = isAdminStaff && extractedPermissions.length > 0;
    const canViewTrashed = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Trash Listing" &&
                perm.status === true
        )
        : true;
    const canAdd = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Create" &&
                perm.status === true
        )
        : true;

    const canDelete = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Permanent Delete" &&
                perm.status === true
        )
        : true;
    const canEdit = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Update" &&
                perm.status === true
        )
        : true;
    const canSoftDelete = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Soft Delete" &&
                perm.status === true
        )
        : true;
    const canRestore = shouldCheckPermissions
        ? extractedPermissions.some(
            (perm) =>
                perm.module === "Supplier" &&
                perm.action === "Restore" &&
                perm.status === true
        )
        : true;

    useEffect(() => {
        const fetchData = async () => {
            setIsTrashed(false);
            setLoading(true);
            await verifyAdminAuth();
            await checkAdminRole();
            await fetchAll(setSuppliers, setLoading);
            setLoading(false);
        };
        fetchData();
    }, [, verifyAdminAuth]);
    useEffect(() => {
        if (typeof window !== "undefined" && suppliers.length > 0 && !loading) {
            let table = null;

            Promise.all([
                import("jquery"),
                import("datatables.net"),
                import("datatables.net-dt"),
                import("datatables.net-buttons"),
                import("datatables.net-buttons-dt")
            ])
                .then(([jQuery]) => {
                    window.jQuery = window.$ = jQuery.default;

                    if ($.fn.DataTable.isDataTable("#supplierTable")) {
                        $("#supplierTable").DataTable().destroy();
                        // Remove the empty() call here
                    }

                    table = $("#supplierTable").DataTable();

                    return () => {
                        if (table) {
                            table.destroy();
                        }
                    };
                })
                .catch((error) => {
                    console.error("Failed to load DataTables dependencies:", error);
                });
        }
    }, [loading]);


    const checkReporting = (id) => {
        router.push(`/admin/supplier/reporting?id=${id}`);
    }
    const viewProfile = (id) => {
        router.push(`/admin/supplier/profile?id=${id}`);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dropshipperData = JSON.parse(localStorage.getItem("shippingData"));
        if (dropshipperData?.project?.active_panel !== "admin") {
            localStorage.clear("shippingData");
            router.push("/admin/auth/login");
            return;
        }

        const token = dropshipperData?.security?.token;
        if (!token) {
            router.push("/admin/auth/login");
            return;
        }

        try {
            Swal.fire({
                title: 'Updating Password...',
                text: 'Please wait ..',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const myHeaders = new Headers();

            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({
                "password": password
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const url = `/api/admin/supplier/${expandPassModal}/password/reset`;

            const response = await fetch(url, requestOptions);

            const result = await response.json(); // Parse the result here

            if (!response.ok) {
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: "Creation Failed",
                    text: result.message || result.error || "An error occurred",
                });


            } else {
                Swal.close();

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: result.message || result.error || `Password Updated successfully!`,
                    showConfirmButton: true,
                }).then((res) => {
                    if (res.isConfirmed) {
                        setExpandPassModal('');
                       fetchAll(setSuppliers, setLoading)
                    }
                });
            }

        } catch (error) {
            console.error("Error:", error);
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Submission Error",
                text: error.message || "Something went wrong. Please try again.",
            });
            setError(error.message || "Submission failed.");
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <HashLoader color="orange" size={50} />
            </div>
        );
    }
    return (

        <div className="bg-white rounded-3xl p-5">
            <div className="flex flex-wrap justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#2B3674]">Suppliers List</h2>
                <div className="flex gap-3 flex-wrap items-center">
                    <button
                        onClick={() => setIsPopupOpen((prev) => !prev)}
                        className="bg-[#F4F7FE] p-2 rounded-lg relative"
                    >
                        <MoreHorizontal className="text-[#F98F5C]" />
                        {isPopupOpen && (
                            <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                                <ul className="py-2 text-sm text-[#2B3674]">
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Export CSV</li>
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Bulk Delete</li>
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                                </ul>
                            </div>
                        )}
                    </button>
                    <div className="flex justify-end gap-2">
                        {canAdd && <button className="bg-[#F98F5C] text-white px-4 py-2 rounded-lg text-sm">
                            <Link href="/admin/supplier/create">Add New</Link>
                        </button>
                        }

                        {canViewTrashed && <button
                            className={`p-3 text-white rounded-md ${isTrashed ? "bg-green-500" : "bg-red-500"}`}
                            onClick={handleToggleTrash}
                        >
                            {isTrashed ? "Supplier Listing (Simple)" : "Trashed Supplier"}
                        </button>
                        }
                    </div>

                </div>
            </div>


            {suppliers.length > 0 ? (
                <div className="overflow-x-auto w-full relative main-outer-wrapper">
                    <table className="display main-tables w-full" id="supplierTable">
                        <thead>
                            <tr className="border-b text-[#A3AED0] border-[#E9EDF7]">
                                <th className="p-3 text-left uppercase whitespace-nowrap">Sr.</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Name</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Email</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Permanent Address</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">View More</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">View Profile</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Check Reporting</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Update Password</th>
                                <th className="p-3 text-left uppercase whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((item, index) => {
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr className="bg-transparent border-b border-[#E9EDF7] text-[#2B3674] font-semibold">
                                            <td className="p-3 text-left whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <label className="flex items-center cursor-pointer mr-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.includes(item.id)}
                                                            onChange={() => handleCheckboxChange(item.id)}
                                                            className="peer hidden"
                                                        />
                                                        <div className="w-4 h-4 border-2 border-[#A3AED0] rounded-sm flex items-center justify-center peer-checked:bg-[#F98F5C] peer-checked:border-0 peer-checked:text-white">
                                                            <FaCheck className="peer-checked:block text-white w-3 h-3" />
                                                        </div>
                                                    </label>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-3 text-left whitespace-nowrap capitalize">{item.name.toLowerCase()}</td>
                                            <td className="p-3 text-left whitespace-nowrap">{item.email}</td>
                                            <td className="p-3 text-left">{item.permanentAddress || '-'}</td>

                                            <td className="p-3 text-center whitespace-nowrap">
                                                <button
                                                    disabled={!item.bankAccount}
                                                    onClick={() =>
                                                        expandedItem?.id === item.id
                                                            ? setExpandedItem(null)
                                                            : setExpandedItem(item)
                                                    }
                                                    className="text-white text-sm rounded-md p-2 bg-[#2B3674] cursor-pointer font-semibold"
                                                >
                                                    {expandedItem?.id === item.id
                                                        ? "Hide Bank Details"
                                                        : "View Bank Details"}
                                                </button>
                                            </td>
                                            <td className="p-3 text-left whitespace-nowrap">
                                                <button
                                                    className='bg-[#3965FF] text-sm rounded-md text-white p-2'
                                                    onClick={() => viewProfile(item.id)}
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                            <td className="p-3 text-left whitespace-nowrap">
                                                <button
                                                    className='bg-orange-500 text-sm rounded-md text-white p-2'
                                                    onClick={() => checkReporting(item.id)}
                                                >
                                                    View Reporting
                                                </button>
                                            </td>
                                            <td className="p-3 text-left whitespace-nowrap">
                                                <button
                                                    className='bg-[#01B574] text-sm rounded-md text-white p-2'
                                                    onClick={() => setExpandPassModal(item.id)}
                                                >
                                                    Update Password
                                                </button>
                                            </td>


                                            <td className="p-3 text-center">
                                                <div className="flex gap-2"> {isTrashed ? (
                                                    <>
                                                        {canRestore && <MdRestoreFromTrash onClick={() => handleRestore(item.id)} className="cursor-pointer text-3xl text-green-500" />}
                                                        {canDelete && <AiOutlineDelete onClick={() => handleDestroy(item.id)} className="cursor-pointer text-3xl" />}
                                                    </>
                                                ) : (
                                                    <>
                                                        {canEdit && <MdModeEdit onClick={() => {
                                                            router.push(`/admin/supplier/update?id=${item.id}`);
                                                            setActiveSubTab('product-details');
                                                        }
                                                        } className="cursor-pointer text-3xl" />
                                                        }
                                                        {canSoftDelete && <AiOutlineDelete onClick={() => handleSoftDelete(item.id)} className="cursor-pointer text-3xl" />}
                                                    </>
                                                )}</div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {expandedItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000094] bg-opacity-40">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
                                <button
                                    onClick={() => setExpandedItem(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                                >
                                    &times;
                                </button>
                                <h2 className="text-xl font-bold mb-4 text-[#2B3674]">Bank Account Details</h2>
                                <div className="space-y-3 text-sm text-[#2B3674]">
                                    <p><span className="font-semibold">Account Holder:</span> {expandedItem?.bankAccount?.accountHolderName || "-"}</p>
                                    <p><span className="font-semibold">Account Number:</span> {expandedItem?.bankAccount?.accountNumber || "-"}</p>
                                    <p><span className="font-semibold">Bank Name:</span> {expandedItem?.bankAccount?.bankName || "-"}</p>
                                    <p><span className="font-semibold">Account Type:</span> {expandedItem?.bankAccount?.accountType || "-"}</p>
                                    <p><span className="font-semibold">IFSC Code:</span> {expandedItem?.bankAccount?.ifscCode || "-"}</p>
                                    <p className="flex items-center">
                                        <span className="font-semibold mr-2">Cheque Image:</span>
                                        {expandedItem?.bankAccount?.cancelledChequeImage ? (
                                            <a
                                                href={expandedItem?.bankAccount?.cancelledChequeImage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                View Cheque Image
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {expandPassModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000094] bg-opacity-40">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
                                <button
                                    onClick={() => setExpandPassModal(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                                >
                                    &times;
                                </button>
                                <h2 className="text-xl font-bold mb-4 text-[#2B3674]">Update Password</h2>
                                <div className="space-y-3 text-sm text-[#2B3674]">
                                    <div >
                                        <label >
                                            Enter New Password
                                        </label>
                                        <input
                                            type='password'
                                            name='password'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2 mt-1 border border-[#E0E5F2] text-[#A3AED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        />

                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        type="submit"
                                        className="w-auto px-10 bg-[#F98F5C] text-white py-3 rounded-lg hover:bg-orange-600"
                                    >
                                        Update Password
                                    </button>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-lg text-gray-500">No suppliers available</div>
            )
            }
        </div >
    );

};

export default SupplierList;
