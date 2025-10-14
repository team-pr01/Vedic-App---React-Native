import React from 'react';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  htmlContent: string;
  
}

const NewsContent: React.FC<Props> = ({ htmlContent }) => {
  const { width } = useWindowDimensions();
const colors = useThemeColors();
  return <RenderHtml  contentWidth={width} source={{ html: htmlContent }} tagsStyles={{
     body: {
         color:colors.text ,
        marginBottom:15}
  }} />;
};

export default NewsContent;
