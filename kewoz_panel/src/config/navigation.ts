import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart2,
  Folder,
  File,
  FileCheck,
  User,
  Group,
  UsersRound,
  UserRoundX,
  Flag,
  Bell,
  Settings2,
  SettingsIcon,
  PhoneCall,
} from "lucide-react";
import type { ComponentType } from "react";
import { MdOutlineGroups2 } from "react-icons/md";
import { IoLanguage } from "react-icons/io5";
import { LuListX } from "react-icons/lu";
import { RiUserForbidLine } from "react-icons/ri";
import { RxAvatar } from "react-icons/rx";
import { FaPager } from "react-icons/fa6";
import DashboardUserListPage from "@/pages/user/UserListPage";
import { AvatarForm } from "@/components/forms/AvatarForm";
import { ROUTES } from "./routes";
import { AddNotification } from "@/pages/Notification/AddPushNotification";
import { AddReportType } from "@/components/forms/AddReportType";
import { AddLanguage } from "@/components/forms/AddLanguageForm";
import React from "react";

import Dashboard1 from "/Images/dashboard1.png";
import PostList1 from "/Images/Reel.png";
import PostList2 from "/Images/relld.png";
import PostListh from "/Images/PostListh.png";
import StoriesList1 from "/Images/gift.png";
import StoriesList2 from "/Images/giftd.png";
import StoriesListh from "/Images/StoriesListh.png";

import giftc from "/Images/list12121212.png";
import giftcd from "/Images/giftcd.png";
import ReportList1 from "/Images/ReportList1.png";
import ReportList2 from "/Images/ReportList2.png";
import UserList1 from "/Images/userlisrrr.png";
import UserList2 from "/Images/UserList2.png";
import CountryWise1 from "/Images/flag12.png";
import CountryWise2 from "/Images/CountryWise2.png";
import CountryWiseh from "/Images/Flagh.png";
import HashtagList1 from "/Images/hashtag12.png";
import HashtagList2 from "/Images/HashtagList2.png";
import HashtagListh from "/Images/HashtagListh.png";
import LanguageList1 from "/Images/language12.png";
import LanguageList2 from "/Images/LanguageList2.png";
import LanguageListh from "/Images/LanguageListh.png";
import BlockList1 from "/Images/block12.png";
import BlockList2 from "/Images/BlockList2.png";
import BlockListh from "/Images/BlockListh.png";
import AvatarList1 from "/Images/empty-wallet.png";
import AvatarList2 from "/Images/empty-walletd.png";
import Settings1 from "/Images/setttingrrrr.png";
import cms1 from "/Images/cms121.png";
import cms2 from "/Images/cms2.png";
import cmsh from "/Images/cmsh.png";
import R2l from "/Images/recharge12.png";
import R2d from "/Images/R2d.png";
import Ml from "/Images/live12.png";
import Md from "/Images/muscid.png";
import ll from "/Images/1121.png";
import ld from "/Images/md.png";
import Arrow from "/Images/Arrow.png";
import noty1 from "/Images/notify12.png";
import noty2 from "/Images/noty2.png";

export interface NavItem {
  title: string;
  path?: string;
  icon?: ComponentType<{ className?: string }>;
  children?: NavItem[];
  isOpen?: boolean;
  badge?: number;
  roles?: string[];
  permissions?: string[];
  modal?: {
    id: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
  };
}

// Helper function to create an image component
const img = (src: string, alt: string) => {
  return function ImgComponent({ className }: { className?: string }) {
    return React.createElement("img", { src, alt, className });
  };
};

export const NAVIGATION: NavItem[] = [
  // {
  //   title: "Modals",
  //   icon: FaPager,
  //   children: [
  //     {
  //       title: "Open Example Modal",
  //       icon: Settings,
  //       modal: {
  //         id: "add-avatar-modal",
  //         component: DashboardUserListPage,
  //         props: {
  //           title: "Welcome to the Example Modal",
  //           message: "This is a full-screen modal that can be opened from the sidebar navigation."
  //         }
  //       }
  //     }
  //   ]
  // },
  {
    title: "PANEL",
    children: [
      {
        title: "Panel",
        icon: img(Dashboard1, "Panel"),
        path: "/dashboard",
      },
    ],
    // path: "/dashboard",
    // icon: LayoutDashboard,
  },
  {
    title: "LISTAS",
    // icon: FileText,
    isOpen: true,
    children: [
      {
        title: "Lista de Reportes",
        icon: img(StoriesList1, "Lista de Reportes"),
        children: [
          {
            title: "Tipos de Reporte",
            path: "/reports-list/report-types",
            icon: UserRoundX,
            // badge: 12,
          },
          {
            title: "Agregar Tipo de Reporte",
            modal: {
              id: "add-report-type-modal",
              component: AddReportType,
              props: {
                title: "Agregar Tipo de Reporte",
                message:
                  "Este es un modal de pantalla completa que se puede abrir desde la navegación lateral.",
              },
            },
            // badge: 12,
          },
          {
            title: "Reportes de Usuarios",
            path: "/reports-list/users",
            icon: UserRoundX,
            // badge: 12,
          },
          {
            title: "Reportes de Grupos",
            path: "/reports-list/groups",
            icon: MdOutlineGroups2,
            // badge: 12,
          },
        ],
      },
      {
        title: "Lista de Usuarios",
        path: "/users/user-list",
        icon: img(UserList1, "Lista de Usuarios"),
      },
      {
        title: "Lista de Usuarios por País",
        path: "/users/countrywise-user-list",
        icon: img(CountryWise1, "Lista de Usuarios por País"),
      },
      {
        title: "Lista de Grupos",
        path: ROUTES.GROUP.LIST,
        icon: Users,
      },
      {
        title: "Idioma",
        icon: img(LanguageList1, "Idioma"),
        children: [
          {
            title: "Idiomas",
            path: "/language/language-list",
            icon: UserRoundX,
            // badge: 12,
          },
          {
            title: "Agregar Idioma",
            icon: MdOutlineGroups2,
            modal: {
              id: "add-avatar-modal",
              component: AddLanguage,
              props: {
                title: "Agregar Idioma",
                message:
                  "Este es un modal de pantalla completa que se puede abrir desde la navegación lateral.",
              },
            },
            // badge: 12,
          },
        ],
      },
      {
        title: "Lista de Bloqueados",
        icon: img(UserList1, "Lista de Bloqueados"),
        path: "/users/block-list",
      },
      {
        title: "Avatares",
        icon: img(UserList1, "Avatares"),
        children: [
          {
            title: "Avatares",
            path: "/avatar/avatar-list",
            icon: UserRoundX,
            // badge: 12,
          },
          {
            title: "Agregar Avatar",
            icon: MdOutlineGroups2,
            modal: {
              id: "add-avatar-modal",
              component: AvatarForm,
              props: {
                title: "Agregar Avatar",
                message:
                  "Este es un modal de pantalla completa que se puede abrir desde la navegación lateral.",
              },
            },
            // badge: 12,
          },
        ],
      },
    ],
  },
  {
    title: "LLAMADAS",
    // icon: FileText,
    isOpen: true,
    children: [
      {
        title: "Llamadas",
        icon: PhoneCall,
        children: [
          {
            title: "Llamadas de Audio",
            path: "/calls/audio-call-list",
            // icon: bell,
            // badge: 12,
          },
          {
            title: "Llamadas de Video",
            path: "/calls/video-call-list",
            // icon: bell,
            // badge: 12,
          },
        ],
      },
    ],
  },
  {
    title: "NOTIFICACIONES",
    // icon: FileText,
    isOpen: true,
    children: [
      {
        title: "Notificaciones",
        icon: img(noty1, "Notificaciones"),
        children: [
          {
            title: "Notificaciones Push",
            path: "/notifications/notification-list",
            // icon: bell,
            // badge: 12,
          },
          {
            title: "Enviar Notificación Push",
            modal: {
              id: "add-notifiaction-modal",
              component: AddNotification,
              props: {
                title: "Enviar Notificación",
                message:
                  "Este es un modal de pantalla completa que se puede abrir desde la navegación lateral.",
              },
            }, // icon: bell,
            // badge: 12,
          },
        ],
      },
      {
        title: "Mensajes Masivos",
        icon: img(noty1, "Mensajes Masivos"),
        children: [
          {
            title: "Mensajes",
            path: "/notifications/mass-messages",
          },
          {
            title: "Enviar Mensaje Masivo",
            path: "/notifications/mass-messages/send",
          },
        ],
      },
    ],
  },
  {
    title: "AJUSTES",
    // icon: FileText,
    isOpen: true,
    children: [
      {
        title: "Configuración",
        icon: img(Settings1, "Configuración"),
        path: "/settings",
      },
      {
        title: "Páginas CMS",
        icon: img(cms1, "Páginas CMS"),
        path: "/cms-pages",
      },
    ],
  },
];
