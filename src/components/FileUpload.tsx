
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Papa from 'papaparse';
import shp from 'shpjs';

interface FileUploadProps {
  onDataLoad: (data: any[], type: string) => void;
}

const FileUpload = ({ onDataLoad }: FileUploadProps) => {
  const processFile = async (file: File) => {
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        const text = await file.text();
        const geoData = JSON.parse(text);
        onDataLoad(geoData.features || [geoData], 'geojson');
        toast.success('GeoJSON file loaded successfully!');
      } 
      else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const data = results.data.filter(row => 
              Object.values(row).some(val => val !== null && val !== '')
            );
            
            // Check for coordinate columns
            const headers = Object.keys(data[0] || {}).map(h => h.toLowerCase());
            const latCol = headers.find(h => ['latitude', 'lat', 'y'].includes(h));
            const lonCol = headers.find(h => ['longitude', 'lon', 'lng', 'x'].includes(h));
            
            if (!latCol || !lonCol) {
              toast.error('CSV must contain latitude/longitude columns');
              return;
            }
            
            onDataLoad(data, 'csv');
            toast.success(`CSV file loaded with ${data.length} records!`);
          },
          error: () => {
            toast.error('Error parsing CSV file');
          }
        });
      }
      else if (fileName.endsWith('.zip') || fileName.endsWith('.shp')) {
        const arrayBuffer = await file.arrayBuffer();
        const geoData = await shp(arrayBuffer);
        onDataLoad(geoData.features || [geoData], 'shapefile');
        toast.success('Shapefile loaded successfully!');
      }
      else {
        toast.error('Unsupported file type. Please upload GeoJSON, CSV, or Shapefile.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please check the format.');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json', '.geojson'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
      'application/octet-stream': ['.shp']
    },
    multiple: false
  });

  return (
    <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div
        {...getRootProps()}
        className={`cursor-pointer text-center py-8 px-4 rounded-lg transition-colors ${
          isDragActive 
            ? 'bg-primary/10 border-primary' 
            : 'hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Upload Geospatial Data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag & drop your files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Supported formats: GeoJSON, CSV (with lat/lon), Shapefile (.zip or .shp)
        </p>
        <Button variant="outline" className="mt-2">
          Choose Files
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload;
