import React from 'react';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

interface Props {
  htmlContent: string;
}

const NewsContent: React.FC<Props> = ({ htmlContent }) => {
  const { width } = useWindowDimensions();

  return <RenderHtml contentWidth={width} source={{ html: htmlContent }} />;
};

export default NewsContent;
