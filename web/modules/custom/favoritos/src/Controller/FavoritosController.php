<?php

namespace Drupal\favoritos\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;

class FavoritosController extends ControllerBase {

  public function toggle($nid, Request $request) {

    $user = User::load(\Drupal::currentUser()->id());
    $node = Node::load($nid);

    if (!$user || !$node) {
      return new JsonResponse(['estado' => 'error']);
    }

    $favoritos = $user->get('field_favoritos')->getValue();
    $ids = array_column($favoritos, 'target_id');

    if (in_array($nid, $ids)) {
      $ids = array_diff($ids, [$nid]);
    } else {
      $ids[] = $nid;
    }

    $user->set('field_favoritos', array_map(function ($id) {
      return ['target_id' => $id];
    }, $ids));

    $user->save();

    return new JsonResponse(['estado' => 'ok']);
  }

}
