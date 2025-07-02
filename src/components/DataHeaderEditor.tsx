
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataHeaderEditorProps {
  data: any[];
  dataType: string;
  onDataUpdate: (data: any[]) => void;
}

const DataHeaderEditor = ({ data, dataType, onDataUpdate }: DataHeaderEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [newHeader, setNewHeader] = useState('');

  React.useEffect(() => {
    if (data.length > 0) {
      const sampleRow = dataType === 'csv' ? data[0] : (data[0]?.properties || {});
      setHeaders(Object.keys(sampleRow));
    }
  }, [data, dataType]);

  const handleSaveHeaders = () => {
    try {
      const updatedData = data.map(item => {
        if (dataType === 'csv') {
          const newItem = {};
          headers.forEach((header, index) => {
            const oldHeader = Object.keys(item)[index];
            newItem[header] = item[oldHeader] || '';
          });
          return newItem;
        } else {
          // For GeoJSON/Shapefile
          const newProperties = {};
          headers.forEach((header, index) => {
            const oldHeader = Object.keys(item.properties || {})[index];
            newProperties[header] = item.properties?.[oldHeader] || '';
          });
          return { ...item, properties: newProperties };
        }
      });

      onDataUpdate(updatedData);
      setIsEditing(false);
      toast.success('Headers updated successfully!');
    } catch (error) {
      toast.error('Failed to update headers');
    }
  };

  const handleAddHeader = () => {
    if (newHeader.trim() && !headers.includes(newHeader.trim())) {
      setHeaders([...headers, newHeader.trim()]);
      setNewHeader('');
    }
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  if (!data.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Data Headers ({headers.length} columns)
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSaveHeaders} className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4" />
                Edit Headers
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveHeader(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  placeholder="Add new header..."
                  value={newHeader}
                  onChange={(e) => setNewHeader(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
                  className="flex-1"
                />
                <Button onClick={handleAddHeader} disabled={!newHeader.trim()}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {headers.map((header, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {header}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataHeaderEditor;
