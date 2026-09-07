import React, { useState } from 'react';
import type { ClinicalStudy } from '../../types';
import { Search, Printer, Copy, Check } from 'lucide-react';

interface DicomMetadataTabProps {
  study: ClinicalStudy;
}

export const DicomMetadataTab: React.FC<DicomMetadataTabProps> = ({ study }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const tags = [
    { tag: '(0008,0016)', vr: 'UI', name: 'SOP Class UID', value: '1.2.840.10008.5.1.4.1.1.1 (Digital X-Ray)' },
    { tag: '(0008,0018)', vr: 'UI', name: 'SOP Instance UID', value: study.metadata.sopInstanceUID },
    { tag: '(0008,0020)', vr: 'DA', name: 'Study Date', value: study.metadata.studyDate },
    { tag: '(0008,0060)', vr: 'CS', name: 'Modality', value: study.metadata.modality },
    { tag: '(0008,0070)', vr: 'LO', name: 'Manufacturer', value: study.metadata.manufacturer },
    { tag: '(0008,0080)', vr: 'LO', name: 'Institution Name', value: study.metadata.institutionName },
    { tag: '(0010,0010)', vr: 'PN', name: "Patient's Name", value: study.metadata.patientName },
    { tag: '(0010,0020)', vr: 'LO', name: 'Patient ID', value: study.metadata.patientId },
    { tag: '(0010,0030)', vr: 'DA', name: "Patient's Birth Date", value: '1971-04-12' },
    { tag: '(0010,0040)', vr: 'CS', name: "Patient's Sex", value: study.metadata.patientSex },
    { tag: '(0010,1010)', vr: 'AS', name: "Patient's Age", value: study.metadata.patientAge },
    { tag: '(0018,0015)', vr: 'CS', name: 'Body Part Examined', value: study.metadata.bodyPart },
    { tag: '(0018,5101)', vr: 'CS', name: 'View Position', value: study.metadata.viewPosition },
    { tag: '(0018,0060)', vr: 'DS', name: 'KVP', value: `${study.metadata.kvp} kV` },
    { tag: '(0018,1150)', vr: 'IS', name: 'Exposure Time', value: `${study.metadata.exposureTime} ms` },
    { tag: '(0018,1151)', vr: 'IS', name: 'X-Ray Tube Current', value: `${study.metadata.xrayTubeCurrent} mA` },
    { tag: '(0020,000D)', vr: 'UI', name: 'Study Instance UID', value: study.metadata.studyInstanceUID },
    { tag: '(0028,0004)', vr: 'CS', name: 'Photometric Interpretation', value: study.metadata.photometricInterpretation },
    { tag: '(0028,0010)', vr: 'US', name: 'Rows', value: '1024' },
    { tag: '(0028,0011)', vr: 'US', name: 'Columns', value: '1024' },
    { tag: '(0028,0030)', vr: 'DS', name: 'Pixel Spacing', value: `${study.metadata.pixelSpacing[0]} \\ ${study.metadata.pixelSpacing[1]} mm` },
    { tag: '(0028,0100)', vr: 'US', name: 'Bits Allocated', value: `${study.metadata.bitsAllocated}` },
    { tag: '(0028,0101)', vr: 'US', name: 'Bits Stored', value: `${study.metadata.bitsStored}` },
    { tag: '(0028,1050)', vr: 'DS', name: 'Window Center', value: `${study.metadata.windowCenter}` },
    { tag: '(0028,1051)', vr: 'DS', name: 'Window Width', value: `${study.metadata.windowWidth}` },
  ];

  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tag.includes(searchTerm) ||
      t.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="dicom-metadata-tab-container">
      {/* Header and Export Tools */}
      <div className="metadata-header-row">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Filter DICOM tags (e.g. 0010, Patient, KVP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tag-search-input"
          />
        </div>
        <button className="btn-secondary" onClick={handlePrintReport} title="Print Clinical Diagnostic Summary">
          <Printer size={14} />
          <span>Print Report</span>
        </button>
      </div>

      {/* DICOM Tag Table */}
      <div className="dicom-tags-table-wrap">
        <table className="dicom-tags-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>VR</th>
              <th>Attribute Name</th>
              <th>Value</th>
              <th>Copy</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((row, idx) => (
              <tr key={idx}>
                <td className="font-mono text-cyan">{row.tag}</td>
                <td className="font-mono text-muted">{row.vr}</td>
                <td className="font-sans font-medium">{row.name}</td>
                <td className="font-mono text-primary tag-val" title={row.value}>
                  {row.value}
                </td>
                <td>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(row.value, row.tag)}
                    title="Copy Value"
                  >
                    {copiedTag === row.tag ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .dicom-metadata-tab-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .metadata-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: rgba(14, 23, 42, 0.7);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .tag-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.8rem;
          outline: none;
          font-family: var(--font-sans);
        }

        .dicom-tags-table-wrap {
          background: rgba(14, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .dicom-tags-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          text-align: left;
        }

        .dicom-tags-table th {
          background: rgba(20, 32, 58, 0.8);
          padding: 8px 12px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.68rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-subtle);
        }

        .dicom-tags-table td {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .dicom-tags-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .text-cyan {
          color: var(--cyan-bright);
        }

        .text-muted {
          color: var(--text-muted);
        }

        .text-emerald {
          color: var(--emerald-success);
        }

        .tag-val {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          border-radius: 4px;
        }

        .copy-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
};
