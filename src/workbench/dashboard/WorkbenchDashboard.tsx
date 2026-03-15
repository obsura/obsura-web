import React from "react";
import { Link } from "react-router-dom";
import { 
  Type, 
  Image as ImageIcon, 
  History, 
  Play, 
  Settings2,
  Zap
} from "lucide-react";
import { Button, Card, PanelHeader, Badge } from "../../components/common/UI";

export default function WorkbenchDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Start a Redaction Job
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto">
          Choose a data type to redact or run a saved configuration to automatically apply your rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Text Job */}
        <Card className="p-6 hover:border-indigo-200 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Type className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="flex items-start gap-4 relatiove z-10">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Redact Text</h3>
              <p className="text-sm text-stone-500 mt-1 mb-4">
                Paste raw text, logs, or documents. Review findings and approve transformations before copying the result.
              </p>
              <Link to="/workbench/jobs/new/text">
                <Button variant="primary">
                  New Text Job
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Image/Screenshot Job */}
        <Card className="p-6 hover:border-indigo-200 transition-colors group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ImageIcon className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Redact Image</h3>
              <p className="text-sm text-stone-500 mt-1 mb-4">
                Upload screenshots or images. Automatically mask texts and blur faces before downloading safely.
              </p>
              <Link to="/workbench/jobs/new/image">
                <Button variant="primary">
                  New Image Job
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Configurations Quick Run */}
        <Card className="p-6 col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-stone-700" />
              <h3 className="font-semibold text-stone-900">Use Saved Configuration</h3>
            </div>
            <Link to="/studio/configurations" className="text-xs text-indigo-600 font-medium hover:underline">
              Manage in Studio &rarr;
            </Link>
          </div>
          <p className="text-sm text-stone-500">
            Apply a complete recipe of rules and default transformations to a new text or image.
          </p>
          <div className="border border-stone-200 rounded-lg divide-y divide-stone-200 bg-stone-50/50 flex flex-col items-center justify-center py-8">
            <Zap className="w-8 h-8 text-stone-300 mb-2" />
            <p className="text-sm font-medium text-stone-500">Select a configuration to run...</p>
            {/* TODO: Fetch and list configurations with a "Run" button next to them */}
            <Link to="/studio/configurations" className="mt-4">
              <Button variant="outline" size="sm">Browse Configurations</Button>
            </Link>
          </div>
        </Card>

        {/* Recent Jobs */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-stone-700" />
              <h3 className="font-semibold text-stone-900">Recent Jobs</h3>
            </div>
            <Link to="/studio/jobs" className="text-xs text-indigo-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center text-stone-500 space-y-2">
            <History className="w-8 h-8 text-stone-300 mb-2" />
            <p className="text-sm">No recent jobs here yet.</p>
            <p className="text-xs">Run a text or image job to see it here.</p>
          </div>
        </Card>
      </div>

    </div>
  );
}
