import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  Folder,
  Plus,
  PlusCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, Link, NavLink } from 'react-router-dom';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import {
  ADD_APPLICATION_PATH,
  ADD_REPORT_PATH,
  APPLICATION_STATUS_UPDATE_PATH,
  ARCHIVE_PATH,
  DOWNLOAD_REPORT_PATH,
  EDIT_APPLICATION_PATH,
  MORTGAGE_ANALYSIS_URL,
  OVERVIEW_PATH,
} from '~/utils/consts';

interface Section {
  id: string;
  text: string;
  defaultOpen: boolean;
  items?: {
    path: string;
    text: string;
    icon: React.ReactNode;
    className: string;
  }[];
  path?: string;
  className?: string;
}

const sections: Section[] = [
  {
    id: 'fileTab',
    text: 'Files and Applicants',
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ADD_APPLICATION_PATH}`,
        text: 'Create',
        icon: <PlusCircle className="h-5 w-5" />,
        className: 'sidebar__create-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${EDIT_APPLICATION_PATH}`,
        text: 'Modify',
        icon: <Plus className="h-5 w-5" />,
        className: 'sidebar__modify-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${APPLICATION_STATUS_UPDATE_PATH}`,
        text: 'Update Status',
        icon: <RefreshCw className="h-5 w-5" />,
        className: 'sidebar__update-status-btn',
      },
    ],
  },
  {
    id: 'reportTab',
    text: 'FinQuantum Summary Reports',
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ADD_REPORT_PATH}`,
        text: 'Generate',
        icon: <PlusCircle className="h-5 w-5" />,
        className: 'sidebar__generate-report-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${DOWNLOAD_REPORT_PATH}`,
        text: 'Download',
        icon: <FileDown className="h-5 w-5" />,
        className: 'sidebar__download-report-btn',
      },
    ],
  },
  {
    id: 'overviewTab',
    text: 'Overview',
    defaultOpen: true,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#files`,
        text: 'Files',
        icon: <Folder className="h-5 w-5" />,
        className: 'sidebar__overview-files-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#applicants`,
        text: 'Applicants',
        icon: <User className="h-5 w-5" />,
        className: 'sidebar__overview-applicants-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${OVERVIEW_PATH}#reports`,
        text: 'Reports',
        icon: <FileText className="h-5 w-5" />,
        className: 'sidebar__overview-reports-btn',
      },
    ],
  },
  {
    id: 'archiveTab',
    text: 'Archive',
    defaultOpen: false,
    items: [
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#files`,
        text: 'Files',
        icon: <Folder className="h-5 w-5" />,
        className: 'sidebar__archive-files-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#applicants`,
        text: 'Applicants',
        icon: <User className="h-5 w-5" />,
        className: 'sidebar__archive-applicants-btn',
      },
      {
        path: `${MORTGAGE_ANALYSIS_URL}${ARCHIVE_PATH}#reports`,
        text: 'Reports',
        icon: <FileText className="h-5 w-5" />,
        className: 'sidebar__archive-reports-btn',
      },
    ],
  },
  {
    id: 'decisionMatrixTab',
    text: 'Decision Matrix / Recommendation (coming soon!)',
    defaultOpen: false,
    items: [],
    path: `${MORTGAGE_ANALYSIS_URL}/decision-matrix`,
    className: 'sidebar__decision-matrix-btn',
  },
];

interface NestedListProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const NestedList: React.FC<NestedListProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize expandedSections state based on the defaultOpen value
  useEffect(() => {
    const initialExpandedState = sections.reduce((acc, section) => {
      acc[section.id] = section.defaultOpen;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(initialExpandedState);
  }, []);

  const toggleExpand = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionClick = (sectionId: string) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col bg-background text-foreground transition-all duration-300',
        sidebarOpen ? 'w-[280px]' : 'w-20',
      )}
    >
      <div className={cn('flex items-center justify-between p-4', !sidebarOpen && 'justify-center')}>
        <NavLink to="/" className="flex items-center justify-center">
          <img
            src={'/images/logo/logo.svg'}
            alt="Logo"
            className={cn('transition-all duration-300', sidebarOpen ? 'w-auto' : 'w-10')}
          />
        </NavLink>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpand}
          className={cn(
            'opacity-0 transition-opacity duration-200 hover:opacity-100',
            'md:opacity-100',
          )}
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {sections.map((section) => (
          <div key={section.id} className="mb-2">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between h-auto',
                !sidebarOpen && 'hidden',
              )}
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-wrap text-left">{section.text}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    expandedSections[section.id] ? 'rotate-180' : '',
                  )}
                />
              </div>
            </Button>
            {expandedSections[section.id] && section.items && section.items.length > 0 && (
              <div className="mt-1 space-y-1">
                {section.items.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      (location.pathname + location.hash).includes(item.path) &&
                        'bg-accent text-accent-foreground',
                    )}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {sidebarOpen && <span>{item.text}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default NestedList;
