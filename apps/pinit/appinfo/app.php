<?php
/**
 * ownCloud - Pinit
 *
 * @author Sebastian Doell
 * @copyright 2014 sebastian doell sebastian@libasys.de
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
namespace OCA\Pinit\AppInfo;

\OCP\App::addNavigationEntry( array(
  'id' => 'pinit',
  'order' => 10,
  'href' => \OCP\Util::linkToRoute('pinit.page.index'),
  'icon' => \OCP\Util::imagePath( 'pinit', 'pinit.svg' ),
  'name' => \OC_L10N::get('pinit')->t('Pinit')));
  

\OCP\Share::registerBackend('pinwall', '\OCA\Pinit\Controller\ShareController');

\OC::$server->getSearch()->registerProvider('OCA\Pinit\Search\Provider');

