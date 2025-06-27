"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  Package,
  CreditCard,
  FileText,
  Settings,
  User,
  Warehouse,
  ClipboardList,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BiSolidCategory } from "react-icons/bi";
import { TbBrandBinance } from "react-icons/tb";

import logo from "@/app/images/Shipowllogo.png";
import { useSupplier } from "./middleware/SupplierMiddleWareContext";

export default function Sidebar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { isSupplierStaff, extractedPermissions, checkSupplierRole } = useSupplier();
  const actions = ['View Listing', 'Update', 'Create', 'Listing', 'View', 'Soft Delete', 'Permanent Delete', 'Restore', 'Trash Listing', 'Bank Account Change Request View Listing', 'Bank Account Change Request Review'];

  const hasPermission = (module, actionList) => {
    return extractedPermissions.some(
      (perm) => perm.module === module && actionList.includes(perm.action) && perm.status === true
    );
  };
  const menuItems = [
    { name: "Dashboard", icon: Home, href: "/supplier" },
    // { name: "Inventory", icon: ShoppingCart, href: "/supplier/inventory" },
    { name: "Products", icon: Package, href: "/supplier/product/my" },
    { name: "New Product Request", icon: Package, href: "/supplier/product/request" },
    { name: "Orders", icon: ClipboardList, href: "/supplier/orders" },
    // { name: "Reporting", icon: FileBarChart2, href: "/supplier/reporting" },
    { name: "Warehouse", icon: Warehouse, href: "/supplier/warehouse" },
    // { name: "Category Management", icon: BiSolidCategory, href: "/supplier/category/list" },
    { name: "Subuser Listing", icon: Package, href: "/supplier/sub-user/list" },
    // { name: "Brand Management", icon: TbBrandBinance, href: "/supplier/brand/list" },
    { name: "RTO Orders", icon: Package, href: "/supplier/rto-orders" },
    { name: "Profile", icon: User, href: "/supplier/profile" },
    { name: "Settings (In progress)", icon: Settings, href: "/supplier/settings" },
    { name: "Billings (In progress)", icon: FileText, href: "/supplier/billings" },
    { name: "Payment (In progress)", icon: CreditCard, href: "/supplier/payment" },
    { name: "Terms & Condition (In progress)", icon: BadgeDollarSign, href: "/supplier/terms" },
  ];
  useEffect(() => {
    checkSupplierRole();
  }, [])

  return (
    <>
      <div className="fixed top-0 w-full left-0 z-50 p-2 bg-white rounded-lg lg:hidden shadow-md">
        <div className="flex justify-between">
          <Image src={logo} alt="ShipOwl Logo" className="max-w-[100px]" />
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-8 h-8 text-[#2C3454]" />
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 w-72 sidebar rounded-md bg-white z-50 shadow-lg lg:w-full transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0 lg:h-full h-[500px] overflow-auto" : "-translate-x-full lg:h-full"} 
        lg:translate-x-0 lg:relative lg:h-full`}
      >
        <div className="flex items-center justify-between lg:justify-center p-5 border-b border-[#F4F7FE]">
          <Image src={logo} alt="ShipOwl Logo" className="max-w-[150px]" />
          <button className="lg:hidden p-1" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6 text-[#2C3454]" />
          </button>
        </div>

        <nav className="p-3 h-full">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href.concat("/");
              const isSubmenuOpen = openSubMenu === item.name;

              return (
                <li key={item.name} className="w-full">
                  {item.subMenu ? (
                    <>
                      <button
                        onClick={() => setOpenSubMenu(isSubmenuOpen ? null : item.name)}
                        className={`font-medium flex gap-2 items-center w-full p-3 rounded-lg hover:bg-[#2C3454] hover:text-white hover:border-[#F98F5C] border-l-4 
                        ${isSubmenuOpen ? "bg-[#2C3454] text-white border-[#F98F5C]" : "bg-[#F0F1F3] border-[#667085]"}`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isSubmenuOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {isSubmenuOpen && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.subMenu.map((sub) => {
                            const isSubActive = pathname === sub.href.concat("/");
                            return (
                              <li key={sub.name}>
                                <Link href={sub.href} className="w-full">
                                  <button
                                    className={`text-left font-normal flex gap-2 items-center w-full p-2 pl-4 rounded-lg hover:bg-[#2C3454] hover:text-white hover:border-[#F98F5C] border-l-4 
                                    ${isSubActive ? "bg-[#2C3454] text-white border-[#F98F5C]" : "bg-[#F0F1F3] border-[#667085]"}`}
                                    onClick={() => setIsSidebarOpen(false)}
                                  >
                                    • <span>{sub.name}</span>
                                  </button>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} className="w-full">
                      <button
                        className={`font-medium flex gap-2 items-center w-full p-3 rounded-lg hover:bg-[#2C3454] hover:text-white hover:border-[#F98F5C] border-l-4 
                        ${isActive ? "bg-[#2C3454] text-white border-[#F98F5C]" : "bg-[#F0F1F3] border-[#667085]"}`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </button>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}