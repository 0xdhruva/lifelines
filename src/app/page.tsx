"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [leftPalmImage, setLeftPalmImage] = useState<File | null>(null);
  const [rightPalmImage, setRightPalmImage] = useState<File | null>(null);
  const [leftPalmPreview, setLeftPalmPreview] = useState<string | null>(null);
  const [rightPalmPreview, setRightPalmPreview] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leftPalmDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLeftPalmImage(file);
        const previewUrl = URL.createObjectURL(file);
        setLeftPalmPreview(previewUrl);
      }
    }
  });

  const rightPalmDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setRightPalmImage(file);
        const previewUrl = URL.createObjectURL(file);
        setRightPalmPreview(previewUrl);
      }
    }
  });

  // Function to parse the reading into sections
  const parseReading = (readingText: string) => {
    if (!readingText) return;
    
    // Regular expressions to extract different sections
    const leftHandSectionRegex = /LEFT HAND ANALYSIS([\s\S]*?)(?=RIGHT HAND ANALYSIS|HAND COMPARISON|SUMMARY|$)/i;
    const rightHandSectionRegex = /RIGHT HAND ANALYSIS([\s\S]*?)(?=HAND COMPARISON|SUMMARY|$)/i;
    const comparisonRegex = /HAND COMPARISON([\s\S]*?)(?=SUMMARY|$)/i;
    const summaryRegex = /SUMMARY([\s\S]*?)$/i;
    
    // Line-specific regexes
    const heartLineRegex = /Heart Line([\s\S]*?)(?=Head Line|Life Line|Fate Line|$)/i;
    const headLineRegex = /Head Line([\s\S]*?)(?=Heart Line|Life Line|Fate Line|$)/i;
    const lifeLineRegex = /Life Line([\s\S]*?)(?=Heart Line|Head Line|Fate Line|$)/i;
    const fateLineRegex = /Fate Line([\s\S]*?)(?=Heart Line|Head Line|Life Line|RIGHT HAND ANALYSIS|HAND COMPARISON|$)/i;
    
    // Extract main sections
    const leftHandSection = readingText.match(leftHandSectionRegex)?.[1] || '';
    const rightHandSection = readingText.match(rightHandSectionRegex)?.[1] || '';
    const comparisonSection = readingText.match(comparisonRegex)?.[1] || '';
    const summarySection = readingText.match(summaryRegex)?.[1] || '';
    
    console.log('Sections found:', {
      leftHand: leftHandSection ? 'yes' : 'no',
      rightHand: rightHandSection ? 'yes' : 'no',
      comparison: comparisonSection ? 'yes' : 'no',
      summary: summarySection ? 'yes' : 'no'
    });

        // Function to clean markdown and format text
        const cleanMarkdown = (text: string) => {
          return text
            .trim()
            .replace(/^[\s\*\-_#:]+|[\s\*\-_#:]+$/g, '') // Remove leading/trailing markdown chars and colons
            .replace(/^(SUMMARY|INSIGHTS|SUMMARY & INSIGHTS):\s*/i, '') // Remove section prefixes
            .replace(/\d+\.\s*$/, '') // Remove trailing numbers like "2." at the end
            .trim();
        };
        
        // Function to format table content with a clean, minimalist design
        const formatTableContent = (content: string) => {
          // Define trait type
          type Trait = {
            name: string;
            leftDesc: string;
            rightDesc: string;
          };
          
          // Create default table structure based on the clean design
          const createCleanTable = (leftHandData?: Record<string, string>, rightHandData?: Record<string, string>) => {
            const traits: Trait[] = [
              { name: 'Heart Line', leftDesc: leftHandData?.heartLine || '', rightDesc: rightHandData?.heartLine || '' },
              { name: 'Head Line', leftDesc: leftHandData?.headLine || '', rightDesc: rightHandData?.headLine || '' },
              { name: 'Life Line', leftDesc: leftHandData?.lifeLine || '', rightDesc: rightHandData?.lifeLine || '' },
              { name: 'Fate Line', leftDesc: leftHandData?.fateLine || '', rightDesc: rightHandData?.fateLine || '' }
            ];
            
            let tableHtml = `
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b dark:border-gray-700">
                      <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Trait</th>
                      <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Left Hand (Inherent)</th>
                      <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Right Hand (Developed)</th>
                    </tr>
                  </thead>
                  <tbody>
            `;
            
            traits.forEach((trait, index) => {
              tableHtml += `
                <tr class="${index !== traits.length - 1 ? 'border-b dark:border-gray-700' : ''}">
                  <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">${trait.name}</td>
                  <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${trait.leftDesc || 'See detailed analysis above'}</td>
                  <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${trait.rightDesc || 'See detailed analysis above'}</td>
                </tr>
              `;
            });
            
            tableHtml += `
                  </tbody>
                </table>
              </div>
            `;
            
            return tableHtml;
          };
          
          // Try to extract data from the content if it's in table format
          if (content.includes('|')) {
            try {
              // Parse the markdown table
              const rows = content.split('\n')
                .map(row => row.trim())
                .filter(row => row.length > 0 && row.includes('|'));
              
              // Skip header separator row (contains only --- and |)
              const dataRows = rows.filter(row => !row.match(/^[\s|\-]+$/));
              
              // Extract traits and descriptions
              const traits: Array<{name: string; leftDesc: string; rightDesc: string}> = [];
              let headerRow: string[] | null = null;
              
              dataRows.forEach((row, index) => {
                const cells = row.split('|')
                  .map(cell => cell.trim())
                  .filter(cell => cell !== '');
                
                if (cells.length >= 3) {
                  if (index === 0) {
                    // This is the header row
                    headerRow = cells;
                  } else {
                    // This is a data row
                    const trait = cells[0];
                    const leftDesc = cells[1];
                    const rightDesc = cells[2];
                    
                    // Keep original palm line names
                    let traitName = trait;
                    
                    traits.push({
                      name: traitName,
                      leftDesc: leftDesc,
                      rightDesc: rightDesc
                    });
                  }
                }
              });
              
              // If we have valid data, create the table
              if (traits.length > 0) {
                let tableHtml = `
                  <div class="overflow-x-auto w-full">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="border-b dark:border-gray-700">
                          <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Trait</th>
                          <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Left Hand (Inherent)</th>
                          <th class="py-3 px-4 font-medium text-gray-900 dark:text-white">Right Hand (Developed)</th>
                        </tr>
                      </thead>
                      <tbody>
                `;
                
                traits.forEach((trait, index) => {
                  tableHtml += `
                    <tr class="${index !== traits.length - 1 ? 'border-b dark:border-gray-700' : ''}">
                      <td class="py-3 px-4 font-medium text-gray-900 dark:text-white">${trait.name}</td>
                      <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${trait.leftDesc}</td>
                      <td class="py-3 px-4 text-gray-700 dark:text-gray-300">${trait.rightDesc}</td>
                    </tr>
                  `;
                });
                
                tableHtml += `
                      </tbody>
                    </table>
                  </div>
                `;
                
                return tableHtml;
              }
            } catch (error) {
              console.error('Error parsing table:', error);
              // Fall back to default table if parsing fails
            }
          }
          
          // If we couldn't parse the content or it's not in table format,
          // try to extract data from the detailed analysis sections
          const leftHandData: Record<string, string> = {};
          const rightHandData: Record<string, string> = {};
          
          // Extract data from the left hand analysis
          const leftHeartLineMatch = leftHeartLine.match(/([^.:\-*]+)/);
          const leftHeadLineMatch = leftHeadLine.match(/([^.:\-*]+)/);
          const leftLifeLineMatch = leftLifeLine.match(/([^.:\-*]+)/);
          const leftFateLineMatch = leftFateLine.match(/([^.:\-*]+)/);
          
          if (leftHeartLineMatch) leftHandData.heartLine = leftHeartLineMatch[1].trim();
          if (leftHeadLineMatch) leftHandData.headLine = leftHeadLineMatch[1].trim();
          if (leftLifeLineMatch) leftHandData.lifeLine = leftLifeLineMatch[1].trim();
          if (leftFateLineMatch) leftHandData.fateLine = leftFateLineMatch[1].trim();
          
          // Extract data from the right hand analysis
          const rightHeartLineMatch = rightHeartLine.match(/([^.:\-*]+)/);
          const rightHeadLineMatch = rightHeadLine.match(/([^.:\-*]+)/);
          const rightLifeLineMatch = rightLifeLine.match(/([^.:\-*]+)/);
          const rightFateLineMatch = rightFateLine.match(/([^.:\-*]+)/);
          
          if (rightHeartLineMatch) rightHandData.heartLine = rightHeartLineMatch[1].trim();
          if (rightHeadLineMatch) rightHandData.headLine = rightHeadLineMatch[1].trim();
          if (rightLifeLineMatch) rightHandData.lifeLine = rightLifeLineMatch[1].trim();
          if (rightFateLineMatch) rightHandData.fateLine = rightFateLineMatch[1].trim();
          
          return createCleanTable(leftHandData, rightHandData);
        };

            // Process left hand lines
    const leftHeartLine = leftHandSection.match(heartLineRegex)?.[1] || '';
    const leftHeadLine = leftHandSection.match(headLineRegex)?.[1] || '';
    const leftLifeLine = leftHandSection.match(lifeLineRegex)?.[1] || '';
    const leftFateLine = leftHandSection.match(fateLineRegex)?.[1] || '';
    
    // Process right hand lines
    const rightHeartLine = rightHandSection.match(heartLineRegex)?.[1] || '';
    const rightHeadLine = rightHandSection.match(headLineRegex)?.[1] || '';
    const rightLifeLine = rightHandSection.match(lifeLineRegex)?.[1] || '';
    const rightFateLine = rightHandSection.match(fateLineRegex)?.[1] || '';
    
    // Update DOM elements with the parsed content
    setTimeout(() => {
      // Set left hand content
      const leftHeartLineElement = document.getElementById('left-heart-line');
      if (leftHeartLineElement) {
        leftHeartLineElement.innerHTML = leftHeartLine ? 
          `<div class="markdown">${cleanMarkdown(leftHeartLine)}</div>` : 
          "Heart line analysis not specifically identified in the reading.";
      }
      
      const leftHeadLineElement = document.getElementById('left-head-line');
      if (leftHeadLineElement) {
        leftHeadLineElement.innerHTML = leftHeadLine ? 
          `<div class="markdown">${cleanMarkdown(leftHeadLine)}</div>` : 
          "Head line analysis not specifically identified in the reading.";
      }
      
      const leftLifeLineElement = document.getElementById('left-life-line');
      if (leftLifeLineElement) {
        leftLifeLineElement.innerHTML = leftLifeLine ? 
          `<div class="markdown">${cleanMarkdown(leftLifeLine)}</div>` : 
          "Life line analysis not specifically identified in the reading.";
      }
      
      const leftFateLineElement = document.getElementById('left-fate-line');
      if (leftFateLineElement) {
        leftFateLineElement.innerHTML = leftFateLine ? 
          `<div class="markdown">${cleanMarkdown(leftFateLine)}</div>` : 
          "Fate line analysis not specifically identified in the reading.";
      }

            // Set right hand content
            const rightHeartLineElement = document.getElementById('right-heart-line');
            if (rightHeartLineElement) {
              rightHeartLineElement.innerHTML = rightHeartLine ? 
                `<div class="markdown">${cleanMarkdown(rightHeartLine)}</div>` : 
                "Heart line analysis not specifically identified in the reading.";
            }
            
            const rightHeadLineElement = document.getElementById('right-head-line');
            if (rightHeadLineElement) {
              rightHeadLineElement.innerHTML = rightHeadLine ? 
                `<div class="markdown">${cleanMarkdown(rightHeadLine)}</div>` : 
                "Head line analysis not specifically identified in the reading.";
            }
            
            const rightLifeLineElement = document.getElementById('right-life-line');
            if (rightLifeLineElement) {
              rightLifeLineElement.innerHTML = rightLifeLine ? 
                `<div class="markdown">${cleanMarkdown(rightLifeLine)}</div>` : 
                "Life line analysis not specifically identified in the reading.";
            }
            
            const rightFateLineElement = document.getElementById('right-fate-line');
            if (rightFateLineElement) {
              rightFateLineElement.innerHTML = rightFateLine ? 
                `<div class="markdown">${cleanMarkdown(rightFateLine)}</div>` : 
                "Fate line analysis not specifically identified in the reading.";
            }
            
            // Set comparison section
            const comparisonElement = document.getElementById('hand-comparison');
            if (comparisonElement && comparisonSection) {
              // Format as table if it contains table structure
              const comparisonContent = cleanMarkdown(comparisonSection);
              comparisonElement.innerHTML = `<div class="markdown">${formatTableContent(comparisonContent)}</div>`;
            } else if (comparisonElement) {
              comparisonElement.innerHTML = "Hand comparison not specifically identified in the reading.";
            }
            
            // Set summary section
            const summaryElement = document.getElementById('reading-summary');
            if (summaryElement && summarySection) {
              summaryElement.innerHTML = `<div class="markdown">${cleanMarkdown(summarySection)}</div>`;
            } else if (summaryElement) {
              summaryElement.innerHTML = "Summary not specifically identified in the reading.";
            }
          }, 100);
        };
  // useEffect to parse reading when it changes
  useEffect(() => {
    if (reading) {
      parseReading(reading);
    }
  }, [reading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leftPalmImage || !rightPalmImage) {
      setError("Please upload both left and right palm images");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReading(""); // Initialize with empty string to show streaming UI
    
    try {
      const formData = new FormData();
      formData.append("leftPalmImage", leftPalmImage);
      formData.append("rightPalmImage", rightPalmImage);
      
      const response = await fetch("/api/palm-reading", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      // Simulate streaming for better UX
      const text = await response.text();
      
      // Simulate gradual text appearance for a better user experience
      let displayedText = "";
      const words = text.split(/\s+/);
      
      for (let i = 0; i < words.length; i++) {
        displayedText += words[i] + " ";
        setReading(displayedText);
        
        // Add a small delay between words to simulate typing
        // Skip delay for every few words to make it faster
        if (i % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // The useEffect hook will handle parsing
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get palm reading. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLeftPalmImage(null);
    setRightPalmImage(null);
    setLeftPalmPreview(null);
    setRightPalmPreview(null);
    setReading(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">🪬 Lifelines</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Discover your destiny through the ancient art of palm reading</p>
          </div>
          {reading ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4 text-center">Your Palm Reading</h2>
                
                {/* Hand Lines Analysis - Two column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Left Hand Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 text-center">Left Hand</h3>
                    
                    {/* Bento boxes for each line type */}
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Heart Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="left-heart-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Head Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="left-head-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Life Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="left-life-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Fate Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="left-fate-line"></div>
                    </div>
                  </div>
                                    {/* Right Hand Column */}
                                    <div className="space-y-4">
                    <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 text-center">Right Hand</h3>
                    
                    {/* Bento boxes for each line type */}
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Heart Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="right-heart-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Head Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="right-head-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Life Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="right-life-line"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                      <h4 className="font-medium text-indigo-500 dark:text-indigo-300 mb-2">Fate Line</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="right-fate-line"></div>
                    </div>
                  </div>
                </div>
                                {/* Comparison Table */}
                                <div className="mb-8">
                  <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 text-center mb-4">Hand Comparison</h3>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="hand-comparison"></div>
                  </div>
                </div>
                
                {/* Summary Section */}
                <div>
                  <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 text-center mb-4">Summary</h3>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900">
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert" id="reading-summary"></div>
                  </div>
                </div>
                
                {/* Hidden div to store the original reading */}
                <div id="original-reading" className="hidden">
                  <ReactMarkdown>{reading}</ReactMarkdown>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Get Another Reading
                </button>
              </div>
            </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Left Palm</label>
                              <div 
                                {...leftPalmDropzone.getRootProps()} 
                                className={`border-2 border-dashed rounded-lg p-2 sm:p-4 text-center cursor-pointer transition-colors ${leftPalmPreview ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20' : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500'}`}
                              >
                                <input {...leftPalmDropzone.getInputProps()} />
                                {leftPalmPreview ? (
                                  <div className="relative h-32 sm:h-48 w-full">
                                    <Image 
                                      src={leftPalmPreview} 
                                      alt="Left palm preview" 
                                      fill
                                      style={{ objectFit: 'contain' }}
                                    />
                                  </div>
                                ) : (
                                  <div className="py-4 sm:py-8">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Drag & drop your left palm image here, or click to select</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Right Palm</label>
                              <div 
                                {...rightPalmDropzone.getRootProps()} 
                                className={`border-2 border-dashed rounded-lg p-2 sm:p-4 text-center cursor-pointer transition-colors ${rightPalmPreview ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20' : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600 dark:hover:border-indigo-500'}`}
                              >
                                <input {...rightPalmDropzone.getInputProps()} />
                                {rightPalmPreview ? (
                                  <div className="relative h-32 sm:h-48 w-full">
                                    <Image 
                                      src={rightPalmPreview} 
                                      alt="Right palm preview" 
                                      fill
                                      style={{ objectFit: 'contain' }}
                                    />
                                  </div>
                                ) : (
                                  <div className="py-4 sm:py-8">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Drag & drop your right palm image here, or click to select</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {error && (
                <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading || !leftPalmImage || !rightPalmImage}
                  className={`px-6 py-3 font-medium rounded-lg transition-colors ${isLoading || !leftPalmImage || !rightPalmImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reading Your Palms...
                    </span>
                  ) : (
                    'Get My Palm Reading'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2025 Lifelines. The ancient art of palmistry, powered by modern AI.</p>
      </footer>
    </div>
  );
}