// General imports
import controller from '@squarespace/controller';

import AddScrollingClass from './controllers/AddScrollingClass';
import BlogLayout from './controllers/BlogLayout';
import BlogProgressBar from './controllers/BlogProgressBar';
import BodyMinHeight from './controllers/BodyMinHeight';
import FadeInContent from './controllers/FadeInContent';
import Folders from './controllers/Folders';
import HeaderScroll from './controllers/HeaderScroll';
import MobileOffset from './controllers/MobileOffset';
import NavOverflow from './controllers/NavOverflow';
import NavToggle from './controllers/NavToggle';
import RelatedPostImages from './controllers/RelatedPostImages';
import SearchToggle from './controllers/SearchToggle';
import SetUpBannerImage from './controllers/SetUpBannerImage';
import SidetrayBlocksOverflow from './controllers/SidetrayBlocksOverflow';
import SocialToggle from './controllers/SocialToggle';
import SyncHeader from './controllers/SyncHeader';

// Bind controllers
controller.register('AddScrollingClass', AddScrollingClass);
controller.register('BlogLayout', BlogLayout);
controller.register('BlogProgressBar', BlogProgressBar);
controller.register('BodyMinHeight', BodyMinHeight);
controller.register('FadeInContent', FadeInContent);
controller.register('Folders', Folders);
controller.register('HeaderScroll', HeaderScroll);
controller.register('MobileOffset', MobileOffset);
controller.register('NavOverflow', NavOverflow);
controller.register('NavToggle', NavToggle);
controller.register('RelatedPostImages', RelatedPostImages);
controller.register('SearchToggle', SearchToggle);
controller.register('SetUpBannerImage', SetUpBannerImage);
controller.register('SidetrayBlocksOverflow', SidetrayBlocksOverflow);
controller.register('SocialToggle', SocialToggle);
controller.register('SyncHeader', SyncHeader);
